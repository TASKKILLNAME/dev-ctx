import { nanoid } from 'nanoid';
import type { DevContext, MemoInfo } from '../types/context.js';
import { analyzeGit } from './git-analyzer.js';
import { scanProject } from './project-scanner.js';

export interface BuildOptions {
  cwd?: string;
  label?: string;
  memos?: MemoInfo[];
}

export async function buildContext(options: BuildOptions = {}): Promise<DevContext> {
  const cwd = options.cwd ?? process.cwd();

  const [git, project] = await Promise.all([
    analyzeGit(cwd),
    scanProject(cwd),
  ]);

  const label =
    options.label ??
    [
      project?.name ?? 'project',
      git?.branch ? `@${git.branch}` : '',
    ].join('');

  return {
    id: nanoid(10),
    label,
    createdAt: new Date().toISOString(),
    workingDirectory: cwd,
    git,
    project,
    memos: options.memos ?? [],
  };
}
