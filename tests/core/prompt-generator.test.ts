import { describe, it, expect } from 'vitest';
import { generatePrompt } from '../../src/core/prompt-generator.js';
import type { DevContext } from '../../src/types/context.js';

const mockContext: DevContext = {
  id: 'abc1234567',
  label: 'test-project@main',
  createdAt: '2025-01-15T10:30:00.000Z',
  workingDirectory: '/home/user/project',
  git: {
    branch: 'main',
    status: '2 modified',
    changedFiles: ['src/index.ts', 'package.json'],
    recentCommits: ['a1b2c3d feat: add login', 'e4f5g6h fix: typo'],
    diff: ' 2 files changed, 15 insertions(+), 3 deletions(-)',
  },
  project: {
    name: 'test-project',
    version: '1.0.0',
    description: 'A test project',
    dependencies: {},
    devDependencies: {},
    scripts: {},
  },
  memos: [
    {
      content: 'Working on #feature login page',
      tags: ['feature'],
      createdAt: '2025-01-15T10:30:00.000Z',
    },
  ],
};

describe('generatePrompt', () => {
  it('generates resume prompt with all sections', async () => {
    const prompt = await generatePrompt(mockContext, 'claude-resume');

    expect(prompt).toContain('test-project@main');
    expect(prompt).toContain('main');
    expect(prompt).toContain('2 modified');
    expect(prompt).toContain('src/index.ts');
    expect(prompt).toContain('Working on #feature login page');
    expect(prompt).toContain('test-project');
  });

  it('generates summary prompt', async () => {
    const prompt = await generatePrompt(mockContext, 'claude-summary');

    expect(prompt).toContain('test-project@main');
    expect(prompt).toContain('main');
  });

  it('handles context without git info', async () => {
    const noGit: DevContext = { ...mockContext, git: null };
    const prompt = await generatePrompt(noGit, 'claude-resume');

    expect(prompt).toContain('test-project@main');
    expect(prompt).not.toContain('Branch:');
  });
});
