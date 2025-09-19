import { pgTable, serial, varchar, text, timestamp, integer, boolean, index } from 'drizzle-orm/pg-core';

export const apiKeys = pgTable('api_keys', {
    id: serial('id').primaryKey(),
    keyId: varchar('key_id', { length: 64 }).notNull().unique(), // Public key identifier
    keyHash: varchar('key_hash', { length: 256 }).notNull(), // Hashed API key
    name: varchar('name', { length: 255 }).notNull(), // Friendly name for the key
    description: text('description'), // Optional description

    // Limits and quotas
    dailyLimit: integer('daily_limit').default(1000), // Requests per day
    monthlyLimit: integer('monthly_limit').default(30000), // Requests per month
    dailyUsage: integer('daily_usage').default(0), // Current daily usage
    monthlyUsage: integer('monthly_usage').default(0), // Current monthly usage
    totalUsage: integer('total_usage').default(0), // Total requests ever

    // Access control
    allowedDomains: text('allowed_domains'), // JSON array of allowed domains/origins
    allowedIPs: text('allowed_ips'), // JSON array of allowed IP addresses

    // Status and timing
    isActive: boolean('is_active').default(true),
    expiresAt: timestamp('expires_at'), // Expiration date (nullable = never expires)
    lastUsedAt: timestamp('last_used_at'),
    lastUsedIp: varchar('last_used_ip', { length: 45 }), // IPv4/IPv6

    // Metadata
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    createdBy: varchar('created_by', { length: 255 }), // Who created this key

    // Usage tracking reset dates
    dailyResetAt: timestamp('daily_reset_at').defaultNow(),
    monthlyResetAt: timestamp('monthly_reset_at').defaultNow(),
}, (table) => {
    return {
        keyIdIdx: index('api_keys_key_id_idx').on(table.keyId),
        isActiveIdx: index('api_keys_is_active_idx').on(table.isActive),
        expiresAtIdx: index('api_keys_expires_at_idx').on(table.expiresAt),
    };
});

// Request logs for analytics and monitoring
export const apiRequestLogs = pgTable('api_request_logs', {
    id: serial('id').primaryKey(),
    keyId: varchar('key_id', { length: 64 }).references(() => apiKeys.keyId, { onDelete: 'cascade' }),
    endpoint: varchar('endpoint', { length: 500 }).notNull(),
    method: varchar('method', { length: 10 }).notNull(),
    statusCode: integer('status_code').notNull(),
    responseTime: integer('response_time'), // in milliseconds
    userAgent: text('user_agent'),
    ipAddress: varchar('ip_address', { length: 45 }),
    referer: text('referer'),
    requestSize: integer('request_size'), // bytes
    responseSize: integer('response_size'), // bytes
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
    return {
        keyIdIdx: index('api_request_logs_key_id_idx').on(table.keyId),
        createdAtIdx: index('api_request_logs_created_at_idx').on(table.createdAt),
        endpointIdx: index('api_request_logs_endpoint_idx').on(table.endpoint),
    };
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
export type ApiRequestLog = typeof apiRequestLogs.$inferSelect;
export type NewApiRequestLog = typeof apiRequestLogs.$inferInsert;