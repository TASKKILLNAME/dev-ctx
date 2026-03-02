export interface AppConfig {
  defaultTemplate: string;
  autoClipboard: boolean;
  maxContexts: number;
  contextDir: string;
  syncUrl: string;
  apiKey: string;
}

export const DEFAULT_CONFIG: AppConfig = {
  defaultTemplate: 'claude-resume',
  autoClipboard: true,
  maxContexts: 50,
  contextDir: '',
  syncUrl: '',
  apiKey: '',
};
