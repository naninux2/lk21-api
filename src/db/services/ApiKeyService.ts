import { db } from '../index';
import { apiKeys, apiRequestLogs } from '../schema';
import { eq, and, lt, gte } from 'drizzle-orm';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';

export interface CreateApiKeyData {
    name: string;
    description?: string;
    dailyLimit?: number;
    monthlyLimit?: number;
    allowedDomains?: string[];
    allowedIPs?: string[];
    expiresAt?: Date;
    createdBy?: string;
}

export interface ApiKeyValidationResult {
    isValid: boolean;
    apiKey?: any;
    reason?: string;
    remainingDailyRequests?: number;
    remainingMonthlyRequests?: number;
}

export class ApiKeyService {

    // Generate a secure API key
    static generateApiKey(): { keyId: string; apiKey: string; keyHash: string } {
        // Generate a unique key ID (public identifier)
        const keyId = 'lk21_' + crypto.randomBytes(12).toString('hex');

        // Generate the actual API key (secret)
        const apiKey = 'sk_' + crypto.randomBytes(32).toString('hex');

        // Hash the API key for storage (never store plain keys)
        const keyHash = CryptoJS.SHA256(apiKey).toString();

        return { keyId, apiKey, keyHash };
    }

    // Create a new API key
    static async createApiKey(data: CreateApiKeyData) {
        try {
            const { keyId, apiKey, keyHash } = this.generateApiKey();

            const now = new Date();
            const monthlyResetAt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const dailyResetAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

            const [newKey] = await db
                .insert(apiKeys)
                .values({
                    keyId,
                    keyHash,
                    name: data.name,
                    description: data.description,
                    dailyLimit: data.dailyLimit || 1000,
                    monthlyLimit: data.monthlyLimit || 30000,
                    allowedDomains: data.allowedDomains ? JSON.stringify(data.allowedDomains) : null,
                    allowedIPs: data.allowedIPs ? JSON.stringify(data.allowedIPs) : null,
                    expiresAt: data.expiresAt,
                    createdBy: data.createdBy || 'CLI',
                    dailyResetAt,
                    monthlyResetAt,
                })
                .returning();

            return {
                ...newKey,
                apiKey, // Return the plain key only once during creation
            };
        } catch (error) {
            console.error('Error creating API key:', error);
            throw error;
        }
    }

    // Validate API key and check limits
    static async validateApiKey(apiKey: string, ipAddress?: string, origin?: string): Promise<ApiKeyValidationResult> {
        try {
            // Hash the provided key
            const keyHash = CryptoJS.SHA256(apiKey).toString();

            // Find the API key in database
            const [dbKey] = await db
                .select()
                .from(apiKeys)
                .where(eq(apiKeys.keyHash, keyHash))
                .limit(1);

            if (!dbKey) {
                return { isValid: false, reason: 'Invalid API key' };
            }

            // Check if key is active
            if (!dbKey.isActive) {
                return { isValid: false, reason: 'API key is deactivated' };
            }

            // Check expiration
            if (dbKey.expiresAt && new Date() > dbKey.expiresAt) {
                return { isValid: false, reason: 'API key has expired' };
            }

            // Check IP restrictions
            if (dbKey.allowedIPs && ipAddress) {
                const allowedIPs = JSON.parse(dbKey.allowedIPs);
                if (!allowedIPs.includes(ipAddress)) {
                    return { isValid: false, reason: 'IP address not allowed' };
                }
            }

            // Check domain restrictions
            if (dbKey.allowedDomains && origin) {
                const allowedDomains = JSON.parse(dbKey.allowedDomains);
                const originDomain = new URL(origin).hostname;
                const isAllowed = allowedDomains.some((domain: string) => {
                    if (domain === '*') return true;
                    if (domain.startsWith('*.')) {
                        return originDomain.endsWith(domain.slice(2));
                    }
                    return originDomain === domain;
                });

                if (!isAllowed) {
                    return { isValid: false, reason: 'Domain not allowed' };
                }
            }

            // Reset usage counters if needed
            await this.resetUsageIfNeeded(dbKey.keyId);

            // Get updated key data
            const [updatedKey] = await db
                .select()
                .from(apiKeys)
                .where(eq(apiKeys.keyId, dbKey.keyId))
                .limit(1);

            if (!updatedKey) {
                return { isValid: false, reason: 'API key not found after reset' };
            }

            // Check daily limit
            if (updatedKey.dailyLimit && (updatedKey.dailyUsage ?? 0) >= updatedKey.dailyLimit) {
                return { isValid: false, reason: 'Daily limit exceeded' };
            }

            // Check monthly limit
            if (updatedKey.monthlyLimit && (updatedKey.monthlyUsage ?? 0) >= updatedKey.monthlyLimit) {
                return { isValid: false, reason: 'Monthly limit exceeded' };
            }

            // Calculate remaining requests
            const remainingDailyRequests = updatedKey.dailyLimit
                ? updatedKey.dailyLimit - (updatedKey.dailyUsage ?? 0)
                : undefined;
            const remainingMonthlyRequests = updatedKey.monthlyLimit
                ? updatedKey.monthlyLimit - (updatedKey.monthlyUsage ?? 0)
                : undefined;

            return {
                isValid: true,
                apiKey: updatedKey,
                remainingDailyRequests,
                remainingMonthlyRequests,
            };
        } catch (error) {
            console.error('Error validating API key:', error);
            return { isValid: false, reason: 'Validation error' };
        }
    }

    // Increment usage counters
    static async incrementUsage(keyId: string, ipAddress?: string) {
        try {
            // First get current values
            const [currentKey] = await db
                .select({
                    dailyUsage: apiKeys.dailyUsage,
                    monthlyUsage: apiKeys.monthlyUsage,
                    totalUsage: apiKeys.totalUsage,
                })
                .from(apiKeys)
                .where(eq(apiKeys.keyId, keyId))
                .limit(1);

            if (!currentKey) return;

            // Update with incremented values
            await db
                .update(apiKeys)
                .set({
                    dailyUsage: (currentKey.dailyUsage ?? 0) + 1,
                    monthlyUsage: (currentKey.monthlyUsage ?? 0) + 1,
                    totalUsage: (currentKey.totalUsage ?? 0) + 1,
                    lastUsedAt: new Date(),
                    lastUsedIp: ipAddress,
                    updatedAt: new Date(),
                })
                .where(eq(apiKeys.keyId, keyId));
        } catch (error) {
            console.error('Error incrementing usage:', error);
        }
    }

    // Log API request
    static async logRequest(data: {
        keyId: string;
        endpoint: string;
        method: string;
        statusCode: number;
        responseTime?: number;
        userAgent?: string;
        ipAddress?: string;
        referer?: string;
        requestSize?: number;
        responseSize?: number;
    }) {
        try {
            await db.insert(apiRequestLogs).values(data);
        } catch (error) {
            console.error('Error logging request:', error);
        }
    }

    // Reset usage counters if needed
    private static async resetUsageIfNeeded(keyId: string) {
        const now = new Date();

        const [key] = await db
            .select()
            .from(apiKeys)
            .where(eq(apiKeys.keyId, keyId))
            .limit(1);

        if (!key) return;

        let needsUpdate = false;
        const updates: any = {};

        // Reset daily usage if needed
        if (key.dailyResetAt && now >= key.dailyResetAt) {
            updates.dailyUsage = 0;
            updates.dailyResetAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            needsUpdate = true;
        }

        // Reset monthly usage if needed
        if (key.monthlyResetAt && now >= key.monthlyResetAt) {
            updates.monthlyUsage = 0;
            updates.monthlyResetAt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            needsUpdate = true;
        }

        if (needsUpdate) {
            updates.updatedAt = now;
            await db
                .update(apiKeys)
                .set(updates)
                .where(eq(apiKeys.keyId, keyId));
        }
    }

    // Get all API keys (without sensitive data)
    static async getAllApiKeys() {
        try {
            return await db
                .select({
                    id: apiKeys.id,
                    keyId: apiKeys.keyId,
                    name: apiKeys.name,
                    description: apiKeys.description,
                    dailyLimit: apiKeys.dailyLimit,
                    monthlyLimit: apiKeys.monthlyLimit,
                    dailyUsage: apiKeys.dailyUsage,
                    monthlyUsage: apiKeys.monthlyUsage,
                    totalUsage: apiKeys.totalUsage,
                    allowedDomains: apiKeys.allowedDomains,
                    allowedIPs: apiKeys.allowedIPs,
                    isActive: apiKeys.isActive,
                    expiresAt: apiKeys.expiresAt,
                    lastUsedAt: apiKeys.lastUsedAt,
                    lastUsedIp: apiKeys.lastUsedIp,
                    createdAt: apiKeys.createdAt,
                    createdBy: apiKeys.createdBy,
                })
                .from(apiKeys)
                .orderBy(apiKeys.createdAt);
        } catch (error) {
            console.error('Error getting API keys:', error);
            return [];
        }
    }

    // Get API key by keyId
    static async getApiKeyByKeyId(keyId: string) {
        try {
            const [key] = await db
                .select({
                    id: apiKeys.id,
                    keyId: apiKeys.keyId,
                    name: apiKeys.name,
                    description: apiKeys.description,
                    dailyLimit: apiKeys.dailyLimit,
                    monthlyLimit: apiKeys.monthlyLimit,
                    dailyUsage: apiKeys.dailyUsage,
                    monthlyUsage: apiKeys.monthlyUsage,
                    totalUsage: apiKeys.totalUsage,
                    allowedDomains: apiKeys.allowedDomains,
                    allowedIPs: apiKeys.allowedIPs,
                    isActive: apiKeys.isActive,
                    expiresAt: apiKeys.expiresAt,
                    lastUsedAt: apiKeys.lastUsedAt,
                    lastUsedIp: apiKeys.lastUsedIp,
                    createdAt: apiKeys.createdAt,
                    createdBy: apiKeys.createdBy,
                })
                .from(apiKeys)
                .where(eq(apiKeys.keyId, keyId))
                .limit(1);

            return key || null;
        } catch (error) {
            console.error('Error getting API key:', error);
            return null;
        }
    }

    // Update API key
    static async updateApiKey(keyId: string, updates: Partial<CreateApiKeyData> & { isActive?: boolean }) {
        try {
            const updateData: any = {
                updatedAt: new Date(),
            };

            if (updates.name) updateData.name = updates.name;
            if (updates.description !== undefined) updateData.description = updates.description;
            if (updates.dailyLimit) updateData.dailyLimit = updates.dailyLimit;
            if (updates.monthlyLimit) updateData.monthlyLimit = updates.monthlyLimit;
            if (updates.allowedDomains) updateData.allowedDomains = JSON.stringify(updates.allowedDomains);
            if (updates.allowedIPs) updateData.allowedIPs = JSON.stringify(updates.allowedIPs);
            if (updates.expiresAt !== undefined) updateData.expiresAt = updates.expiresAt;
            if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

            const [updatedKey] = await db
                .update(apiKeys)
                .set(updateData)
                .where(eq(apiKeys.keyId, keyId))
                .returning();

            return updatedKey;
        } catch (error) {
            console.error('Error updating API key:', error);
            throw error;
        }
    }

    // Revoke (deactivate) API key
    static async revokeApiKey(keyId: string) {
        try {
            const [revokedKey] = await db
                .update(apiKeys)
                .set({
                    isActive: false,
                    updatedAt: new Date(),
                })
                .where(eq(apiKeys.keyId, keyId))
                .returning();

            return revokedKey;
        } catch (error) {
            console.error('Error revoking API key:', error);
            throw error;
        }
    }

    // Delete API key permanently
    static async deleteApiKey(keyId: string) {
        try {
            await db.delete(apiKeys).where(eq(apiKeys.keyId, keyId));
            return true;
        } catch (error) {
            console.error('Error deleting API key:', error);
            return false;
        }
    }
}