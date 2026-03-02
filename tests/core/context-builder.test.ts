import { describe, it, expect } from 'vitest';
import { buildContext } from '../../src/core/context-builder.js';
import { parseMemos } from '../../src/core/memo-manager.js';
import { tmpdir } from 'node:os';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

describe('buildContext', () => {
  it('builds context with label and memos', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'dev-ctx-test-'));
    try {
      const memos = parseMemos(['Working on #feature login page']);
      const ctx = await buildContext({
        cwd: dir,
        label: 'test-context',
        memos,
      });

      expect(ctx.id).toBeTruthy();
      expect(ctx.id.length).toBe(10);
      expect(ctx.label).toBe('test-context');
      expect(ctx.createdAt).toBeTruthy();
      expect(ctx.workingDirectory).toBe(dir);
      expect(ctx.memos).toHaveLength(1);
      expect(ctx.memos[0].tags).toContain('feature');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('picks up project info from package.json', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'dev-ctx-test-'));
    try {
      await writeFile(
        join(dir, 'package.json'),
        JSON.stringify({ name: 'my-app', version: '1.0.0' }),
      );

      const ctx = await buildContext({ cwd: dir });
      expect(ctx.project).not.toBeNull();
      expect(ctx.project!.name).toBe('my-app');
      expect(ctx.project!.version).toBe('1.0.0');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('generates auto-label from project name', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'dev-ctx-test-'));
    try {
      await writeFile(
        join(dir, 'package.json'),
        JSON.stringify({ name: 'cool-project', version: '2.0.0' }),
      );

      const ctx = await buildContext({ cwd: dir });
      expect(ctx.label).toContain('cool-project');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
