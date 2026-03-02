import type { MemoInfo } from '../types/context.js';

const TAG_REGEX = /#(\w+)/g;

export function parseMemo(content: string): MemoInfo {
  const tags: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = TAG_REGEX.exec(content)) !== null) {
    tags.push(match[1]);
  }

  return {
    content: content.trim(),
    tags,
    createdAt: new Date().toISOString(),
  };
}

export function parseMemos(inputs: string[]): MemoInfo[] {
  return inputs.filter((s) => s.trim().length > 0).map(parseMemo);
}
