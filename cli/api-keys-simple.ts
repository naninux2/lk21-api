#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { ApiKeyService, CreateApiKeyData } from '../src/db/services/ApiKeyService';
import '../src/db/index'; // Initialize database connection

const program = new Command();

program
    .name('lk21-api-keys')
    .description('CLI tool for managing LK21 API keys')
    .version('1.0.0');

// Create new API key
program
    .command('create')
    .description('Create a new API key')
    .option('-n, --name <name>', 'API key name')
    .option('-d, --description <desc>', 'API key description')
    .option('--daily-limit <limit>', 'Daily request limit', parseInt)
    .option('--monthly-limit <limit>', 'Monthly request limit', parseInt)
    .option('--expires <date>', 'Expiration date (YYYY-MM-DD)')
    .option('--domains <domains>', 'Allowed domains (comma-separated)')
    .option('--ips <ips>', 'Allowed IP addresses (comma-separated)')
    .action(async (options) => {
        try {
            if (!options.name) {
                console.error(chalk.red('❌ Name is required. Use --name <name>'));
                console.log(chalk.blue('\nExample: bun run cli:create --name "My App" --description "My mobile app" --domains "*.myapp.com"'));
                process.exit(1);
            }

            const apiKeyData: CreateApiKeyData = {
                name: options.name,
                description: options.description,
                dailyLimit: options.dailyLimit || 1000,
                monthlyLimit: options.monthlyLimit || 30000,
                allowedDomains: options.domains ? options.domains.split(',').map((d: string) => d.trim()) : undefined,
                allowedIPs: options.ips ? options.ips.split(',').map((ip: string) => ip.trim()) : undefined,
                expiresAt: options.expires ? new Date(options.expires) : undefined
            };

            console.log(chalk.yellow('\n⏳ Creating API key...'));

            const newKey = await ApiKeyService.createApiKey(apiKeyData);

            console.log(chalk.green('\n✅ API key created successfully!\n'));

            const table = new Table({
                head: ['Property', 'Value'],
                colWidths: [20, 50]
            });

            table.push(
                ['Key ID', newKey.keyId],
                ['API Key', chalk.red(newKey.apiKey)],
                ['Name', newKey.name],
                ['Description', newKey.description || 'N/A'],
                ['Daily Limit', newKey.dailyLimit?.toString() || 'Unlimited'],
                ['Monthly Limit', newKey.monthlyLimit?.toString() || 'Unlimited'],
                ['Allowed Domains', newKey.allowedDomains || 'All'],
                ['Allowed IPs', newKey.allowedIPs || 'All'],
                ['Expires At', newKey.expiresAt?.toISOString() || 'Never']
            );

            console.log(table.toString());

            console.log(chalk.red('\n⚠️  IMPORTANT: Save the API key above securely. It won\'t be shown again!\n'));

        } catch (error) {
            console.error(chalk.red('❌ Error creating API key:'), error);
            process.exit(1);
        }
    });

// List all API keys
program
    .command('list')
    .alias('ls')
    .description('List all API keys')
    .option('-a, --active-only', 'Show only active API keys')
    .action(async (options) => {
        try {
            console.log(chalk.blue('📋 Fetching API keys...\n'));

            const apiKeys = await ApiKeyService.getAllApiKeys();
            const filteredKeys = options.activeOnly ? apiKeys.filter(key => key.isActive) : apiKeys;

            if (filteredKeys.length === 0) {
                console.log(chalk.yellow('📭 No API keys found.'));
                return;
            }

            const table = new Table({
                head: ['Key ID', 'Name', 'Status', 'Daily Usage', 'Monthly Usage', 'Last Used', 'Expires'],
                colWidths: [20, 20, 10, 15, 15, 15, 12]
            });

            filteredKeys.forEach(key => {
                const status = key.isActive ? chalk.green('Active') : chalk.red('Inactive');
                const dailyUsage = `${key.dailyUsage || 0}/${key.dailyLimit || '∞'}`;
                const monthlyUsage = `${key.monthlyUsage || 0}/${key.monthlyLimit || '∞'}`;
                const lastUsed = key.lastUsedAt
                    ? new Date(key.lastUsedAt).toLocaleDateString()
                    : 'Never';
                const expires = key.expiresAt
                    ? new Date(key.expiresAt).toLocaleDateString()
                    : 'Never';

                table.push([
                    key.keyId,
                    key.name,
                    status,
                    dailyUsage,
                    monthlyUsage,
                    lastUsed,
                    expires
                ]);
            });

            console.log(table.toString());
            console.log(chalk.blue(`\n📊 Total: ${filteredKeys.length} API key(s)\n`));

        } catch (error) {
            console.error(chalk.red('❌ Error fetching API keys:'), error);
            process.exit(1);
        }
    });

// Show API key details
program
    .command('show <keyId>')
    .description('Show detailed information about an API key')
    .action(async (keyId) => {
        try {
            console.log(chalk.blue(`🔍 Fetching API key: ${keyId}\n`));

            const apiKey = await ApiKeyService.getApiKeyByKeyId(keyId);

            if (!apiKey) {
                console.error(chalk.red('❌ API key not found'));
                process.exit(1);
            }

            const table = new Table({
                head: ['Property', 'Value'],
                colWidths: [20, 50]
            });

            table.push(
                ['Key ID', apiKey.keyId],
                ['Name', apiKey.name],
                ['Description', apiKey.description || 'N/A'],
                ['Status', apiKey.isActive ? chalk.green('Active') : chalk.red('Inactive')],
                ['Daily Limit', apiKey.dailyLimit?.toString() || 'Unlimited'],
                ['Daily Usage', apiKey.dailyUsage?.toString() || '0'],
                ['Monthly Limit', apiKey.monthlyLimit?.toString() || 'Unlimited'],
                ['Monthly Usage', apiKey.monthlyUsage?.toString() || '0'],
                ['Total Usage', apiKey.totalUsage?.toString() || '0'],
                ['Allowed Domains', apiKey.allowedDomains || 'All'],
                ['Allowed IPs', apiKey.allowedIPs || 'All'],
                ['Created At', apiKey.createdAt ? new Date(apiKey.createdAt).toLocaleString() : 'N/A'],
                ['Created By', apiKey.createdBy || 'Unknown'],
                ['Last Used At', apiKey.lastUsedAt ? new Date(apiKey.lastUsedAt).toLocaleString() : 'Never'],
                ['Last Used IP', apiKey.lastUsedIp || 'N/A'],
                ['Expires At', apiKey.expiresAt ? new Date(apiKey.expiresAt).toLocaleString() : 'Never']
            );

            console.log(table.toString());
            console.log();

        } catch (error) {
            console.error(chalk.red('❌ Error fetching API key:'), error);
            process.exit(1);
        }
    });

// Revoke API key
program
    .command('revoke <keyId>')
    .description('Revoke (deactivate) an API key')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (keyId, options) => {
        try {
            if (!options.yes) {
                console.log(chalk.yellow(`⚠️  Are you sure you want to revoke API key: ${keyId}? (y/N)`));
                process.stdout.write('> ');

                // Simple readline for confirmation
                const response = await new Promise<string>((resolve) => {
                    process.stdin.once('data', (data) => resolve(data.toString().trim()));
                });

                if (response.toLowerCase() !== 'y' && response.toLowerCase() !== 'yes') {
                    console.log(chalk.yellow('❌ Cancelled'));
                    return;
                }
            }

            console.log(chalk.yellow(`⏳ Revoking API key: ${keyId}...`));

            const revokedKey = await ApiKeyService.revokeApiKey(keyId);

            if (!revokedKey) {
                console.error(chalk.red('❌ API key not found'));
                process.exit(1);
            }

            console.log(chalk.green(`✅ API key revoked successfully: ${keyId}\n`));

        } catch (error) {
            console.error(chalk.red('❌ Error revoking API key:'), error);
            process.exit(1);
        }
    });

// Update API key
program
    .command('update <keyId>')
    .description('Update an API key')
    .option('-n, --name <name>', 'Update name')
    .option('-d, --description <desc>', 'Update description')
    .option('--daily-limit <limit>', 'Update daily limit', parseInt)
    .option('--monthly-limit <limit>', 'Update monthly limit', parseInt)
    .option('--expires <date>', 'Update expiration date (YYYY-MM-DD)')
    .option('--domains <domains>', 'Update allowed domains (comma-separated)')
    .option('--ips <ips>', 'Update allowed IP addresses (comma-separated)')
    .option('--activate', 'Activate API key')
    .option('--deactivate', 'Deactivate API key')
    .action(async (keyId, options) => {
        try {
            const updates: any = {};

            if (options.name) updates.name = options.name;
            if (options.description !== undefined) updates.description = options.description;
            if (options.dailyLimit) updates.dailyLimit = options.dailyLimit;
            if (options.monthlyLimit) updates.monthlyLimit = options.monthlyLimit;
            if (options.expires) updates.expiresAt = new Date(options.expires);
            if (options.domains) updates.allowedDomains = options.domains.split(',').map((d: string) => d.trim());
            if (options.ips) updates.allowedIPs = options.ips.split(',').map((ip: string) => ip.trim());
            if (options.activate) updates.isActive = true;
            if (options.deactivate) updates.isActive = false;

            if (Object.keys(updates).length === 0) {
                console.error(chalk.red('❌ No updates specified. Use --help to see available options.'));
                process.exit(1);
            }

            console.log(chalk.yellow(`⏳ Updating API key: ${keyId}...`));

            const updatedKey = await ApiKeyService.updateApiKey(keyId, updates);

            if (!updatedKey) {
                console.error(chalk.red('❌ API key not found'));
                process.exit(1);
            }

            console.log(chalk.green(`✅ API key updated successfully: ${keyId}\n`));

        } catch (error) {
            console.error(chalk.red('❌ Error updating API key:'), error);
            process.exit(1);
        }
    });

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n👋 Goodbye!'));
    process.exit(0);
});

program.parse();