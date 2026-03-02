import type { DevContext } from '../types/context.js';
import type { RemoteContextMeta, SyncResult } from '../types/sync.js';
import { getConfig } from './config-store.js';

interface RemoteConfig {
  syncUrl: string;
  apiKey: string;
}

function getRemoteConfig(): RemoteConfig | null {
  const config = getConfig();
  if (!config.syncUrl || !config.apiKey) return null;
  return { syncUrl: config.syncUrl.replace(/\/$/, ''), apiKey: config.apiKey };
}

async function request(
  method: string,
  path: string,
  body?: unknown,
): Promise<Response> {
  const remote = getRemoteConfig();
  if (!remote) throw new Error('Remote sync not configured');

  const url = `${remote.syncUrl}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${remote.apiKey}`,
    'Content-Type': 'application/json',
  };

  return fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function isRemoteConfigured(): boolean {
  return getRemoteConfig() !== null;
}

export async function pushContext(ctx: DevContext): Promise<SyncResult> {
  try {
    const res = await request('PUT', `/api/contexts/${ctx.id}`, ctx);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      return { success: false, message: data.error ?? `HTTP ${res.status}` };
    }
    return { success: true, message: 'Pushed to remote' };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function pullContexts(): Promise<RemoteContextMeta[]> {
  const res = await request('GET', '/api/contexts');
  if (!res.ok) throw new Error(`Failed to fetch remote contexts: HTTP ${res.status}`);
  const data = (await res.json()) as { contexts: RemoteContextMeta[] };
  return data.contexts;
}

export async function pullContext(id: string): Promise<DevContext | null> {
  try {
    const res = await request('GET', `/api/contexts/${id}`);
    if (!res.ok) return null;
    return (await res.json()) as DevContext;
  } catch {
    return null;
  }
}

export async function deleteRemoteContext(id: string): Promise<SyncResult> {
  try {
    const res = await request('DELETE', `/api/contexts/${id}`);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      return { success: false, message: data.error ?? `HTTP ${res.status}` };
    }
    return { success: true, message: 'Deleted from remote' };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}
