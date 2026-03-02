import { describe, it, expect } from 'vitest';
import { analyzeGit } from '../../src/core/git-analyzer.js';
import { tmpdir } from 'node:os';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { simpleGit } from 'simple-git';

describe('analyzeGit', () => {
  it('returns null for non-git directory', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'dev-ctx-test-'));
    try {
      const result = await analyzeGit(dir);
      expect(result).toBeNull();
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('returns git info for a git repo', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'dev-ctx-test-'));
    try {
      const git = simpleGit(dir);
      await git.init();
      await git.addConfig('user.email', 'test@test.com');
      await git.addConfig('user.name', 'Test');

      // Create a file and commit
      const { writeFile } = await import('node:fs/promises');
      await writeFile(join(dir, 'test.txt'), 'hello');
      await git.add('test.txt');
      await git.commit('initial commit');

      const result = await analyzeGit(dir);
      expect(result).not.toBeNull();
      expect(result!.branch).toBeTruthy();
      expect(result!.recentCommits.length).toBeGreaterThan(0);
      expect(result!.status).toBe('clean');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('detects modified files', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'dev-ctx-test-'));
    try {
      const git = simpleGit(dir);
      await git.init();
      await git.addConfig('user.email', 'test@test.com');
      await git.addConfig('user.name', 'Test');

      const { writeFile } = await import('node:fs/promises');
      await writeFile(join(dir, 'test.txt'), 'hello');
      await git.add('test.txt');
      await git.commit('initial commit');

      // Modify the file
      await writeFile(join(dir, 'test.txt'), 'hello world');

      const result = await analyzeGit(dir);
      expect(result).not.toBeNull();
      expect(result!.changedFiles).toContain('test.txt');
      expect(result!.status).toContain('modified');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
