import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProjectInfo } from '../types/context.js';

export async function scanProject(cwd: string): Promise<ProjectInfo | null> {
  try {
    const pkgPath = join(cwd, 'package.json');
    const raw = await readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(raw) as Record<string, unknown>;

    return {
      name: (pkg.name as string) ?? 'unknown',
      version: (pkg.version as string) ?? '0.0.0',
      description: (pkg.description as string) ?? '',
      dependencies: (pkg.dependencies as Record<string, string>) ?? {},
      devDependencies: (pkg.devDependencies as Record<string, string>) ?? {},
      scripts: (pkg.scripts as Record<string, string>) ?? {},
    };
  } catch {
    return null;
  }
}
