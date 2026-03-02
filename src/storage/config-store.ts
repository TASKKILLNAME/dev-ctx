import Conf from 'conf';
import type { AppConfig } from '../types/config.js';
import { DEFAULT_CONFIG } from '../types/config.js';

const store = new Conf<AppConfig>({
  projectName: 'dev-ctx',
  defaults: DEFAULT_CONFIG,
});

export function getConfig(): AppConfig {
  return {
    defaultTemplate: store.get('defaultTemplate'),
    autoClipboard: store.get('autoClipboard'),
    maxContexts: store.get('maxContexts'),
    contextDir: store.get('contextDir'),
    syncUrl: store.get('syncUrl'),
    apiKey: store.get('apiKey'),
  };
}

export function setConfig<K extends keyof AppConfig>(
  key: K,
  value: AppConfig[K],
): void {
  store.set(key, value);
}

export function getContextDir(): string {
  const custom = store.get('contextDir');
  if (custom) return custom;

  const home = process.env.HOME ?? process.env.USERPROFILE ?? '';
  return `${home}/.dev-ctx/contexts`;
}
