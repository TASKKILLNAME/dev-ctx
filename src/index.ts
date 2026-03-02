// Library entrypoint
export type { DevContext, GitInfo, ProjectInfo, MemoInfo } from './types/context.js';
export type { AppConfig } from './types/config.js';
export type { RemoteContextMeta, SyncResult } from './types/sync.js';

export { buildContext } from './core/context-builder.js';
export { analyzeGit } from './core/git-analyzer.js';
export { scanProject } from './core/project-scanner.js';
export { parseMemo, parseMemos } from './core/memo-manager.js';
export { generatePrompt } from './core/prompt-generator.js';

export { saveContext, loadContext, listContexts, deleteContext } from './storage/context-store.js';
export { getConfig, setConfig } from './storage/config-store.js';
export {
  isRemoteConfigured,
  pushContext,
  pullContexts,
  pullContext,
  deleteRemoteContext,
} from './storage/remote-store.js';
