import { readFile, writeFile, readdir, unlink, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { DevContext } from '../types/context.js';
import { getContextDir } from './config-store.js';

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

function contextPath(dir: string, id: string): string {
  return join(dir, `${id}.json`);
}

export async function saveContext(ctx: DevContext): Promise<string> {
  const dir = getContextDir();
  await ensureDir(dir);
  const filePath = contextPath(dir, ctx.id);
  await writeFile(filePath, JSON.stringify(ctx, null, 2), 'utf-8');
  return filePath;
}

export async function loadContext(id: string): Promise<DevContext | null> {
  try {
    const dir = getContextDir();
    const raw = await readFile(contextPath(dir, id), 'utf-8');
    return JSON.parse(raw) as DevContext;
  } catch {
    return null;
  }
}

export async function listContexts(): Promise<DevContext[]> {
  try {
    const dir = getContextDir();
    await ensureDir(dir);
    const files = await readdir(dir);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    const contexts: DevContext[] = [];
    for (const file of jsonFiles) {
      try {
        const raw = await readFile(join(dir, file), 'utf-8');
        contexts.push(JSON.parse(raw) as DevContext);
      } catch {
        // skip corrupted files
      }
    }

    return contexts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch {
    return [];
  }
}

export async function deleteContext(id: string): Promise<boolean> {
  try {
    const dir = getContextDir();
    await unlink(contextPath(dir, id));
    return true;
  } catch {
    return false;
  }
}
