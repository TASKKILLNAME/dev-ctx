export interface GitInfo {
  branch: string;
  status: string;
  changedFiles: string[];
  recentCommits: string[];
  diff: string;
}

export interface ProjectInfo {
  name: string;
  version: string;
  description: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
}

export interface MemoInfo {
  content: string;
  tags: string[];
  createdAt: string;
}

export interface DevContext {
  id: string;
  label: string;
  createdAt: string;
  workingDirectory: string;
  git: GitInfo | null;
  project: ProjectInfo | null;
  memos: MemoInfo[];
}
