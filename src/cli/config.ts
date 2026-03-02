import { Command } from 'commander';
import { getConfig, setConfig } from '../storage/config-store.js';
import type { AppConfig } from '../types/config.js';
import { logger } from '../utils/logger.js';

const VALID_KEYS: (keyof AppConfig)[] = [
  'defaultTemplate',
  'autoClipboard',
  'maxContexts',
  'contextDir',
  'syncUrl',
  'apiKey',
];

function parseValue(key: keyof AppConfig, raw: string): AppConfig[keyof AppConfig] {
  switch (key) {
    case 'autoClipboard':
      return raw === 'true';
    case 'maxContexts':
      return parseInt(raw, 10);
    default:
      return raw;
  }
}

export const configCommand = new Command('config')
  .description('Manage dev-ctx configuration');

configCommand
  .command('set')
  .description('Set a configuration value')
  .argument('<key>', `Config key (${VALID_KEYS.join(', ')})`)
  .argument('<value>', 'Config value')
  .action((key: string, value: string) => {
    if (!VALID_KEYS.includes(key as keyof AppConfig)) {
      logger.error(`Invalid config key: ${key}`);
      logger.dim(`  Valid keys: ${VALID_KEYS.join(', ')}`);
      process.exitCode = 1;
      return;
    }

    const typedKey = key as keyof AppConfig;
    const parsed = parseValue(typedKey, value);
    setConfig(typedKey, parsed as never);

    const display = key === 'apiKey' ? value.slice(0, 4) + '****' : value;
    logger.success(`${key} = ${display}`);
  });

configCommand
  .command('get')
  .description('Get a configuration value')
  .argument('<key>', 'Config key')
  .action((key: string) => {
    if (!VALID_KEYS.includes(key as keyof AppConfig)) {
      logger.error(`Invalid config key: ${key}`);
      process.exitCode = 1;
      return;
    }

    const config = getConfig();
    const value = config[key as keyof AppConfig];
    const display = key === 'apiKey' && value ? String(value).slice(0, 4) + '****' : value;
    console.log(`${key} = ${display ?? '(not set)'}`);
  });

configCommand
  .command('list')
  .alias('ls')
  .description('List all configuration values')
  .action(() => {
    const config = getConfig();
    console.log();
    for (const key of VALID_KEYS) {
      const value = config[key];
      const display = key === 'apiKey' && value ? String(value).slice(0, 4) + '****' : value;
      console.log(`  ${key} = ${display || '(not set)'}`);
    }
    console.log();
  });
