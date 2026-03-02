import { simpleGit, type SimpleGit } from 'simple-git';
import type { GitInfo } from '../types/context.js';

export async function analyzeGit(cwd: string): Promise<GitInfo | null> {
  const git: SimpleGit = simpleGit(cwd);

  try {
    const isRepo = await git.checkIsRepo();
    if (!isRepo) return null;

    const [branchSummary, statusSummary, logResult, diffResult] =
      await Promise.all([
        git.branch(),
        git.status(),
        git.log({ maxCount: 5, '--format': '%h %s' }),
        git.diff(['--stat']),
      ]);

    const changedFiles = [
      ...statusSummary.modified,
      ...statusSummary.created,
      ...statusSummary.deleted,
      ...statusSummary.not_added,
    ];

    const recentCommits = logResult.all.map(
      (c) => `${c.hash.slice(0, 7)} ${c.message}`,
    );

    const statusParts: string[] = [];
    if (statusSummary.staged.length > 0)
      statusParts.push(`${statusSummary.staged.length} staged`);
    if (statusSummary.modified.length > 0)
      statusParts.push(`${statusSummary.modified.length} modified`);
    if (statusSummary.not_added.length > 0)
      statusParts.push(`${statusSummary.not_added.length} untracked`);
    if (statusSummary.deleted.length > 0)
      statusParts.push(`${statusSummary.deleted.length} deleted`);

    return {
      branch: branchSummary.current,
      status: statusParts.length > 0 ? statusParts.join(', ') : 'clean',
      changedFiles,
      recentCommits,
      diff: diffResult || '',
    };
  } catch {
    return null;
  }
}
