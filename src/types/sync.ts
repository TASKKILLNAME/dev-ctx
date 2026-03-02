export interface RemoteConfig {
  syncUrl: string;
  apiKey: string;
}

export interface RemoteContextMeta {
  id: string;
  label: string;
  createdAt: string;
  branch: string | null;
}

export interface SyncResult {
  success: boolean;
  message: string;
}
