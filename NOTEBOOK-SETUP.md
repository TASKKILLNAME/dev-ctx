# dev-ctx 노트북 설정 가이드

데스크탑과 컨텍스트를 공유하기 위한 노트북 설정 절차.

## 1. dev-ctx 설치

```bash
npm install -g @npm_lee/dev-ctx
```

## 2. 원격 동기화 설정

```bash
dev-ctx config set syncUrl https://dev-ctx-api.dongjunjwa4020.workers.dev
dev-ctx config set apiKey 0yAlSZapYeznUT3JxsKpQLY-N6XLOfqg
```

설정 확인:
```bash
dev-ctx config list
```

## 3. Claude Code 스킬 등록

아래 4개 파일을 생성한다.

### 3-1. `~/.claude/skills/dev-ctx-save/SKILL.md`

```markdown
---
name: dev-ctx-save
description: Save current development context and sync to remote
argument-hint: "[memo]"
disable-model-invocation: true
---

# Save Development Context

Save the current development context with the provided memo. If remote sync is configured, the context is automatically pushed to the remote server for cross-device access.

!`dev-ctx save --auto --sync -m "$ARGUMENTS" 2>&1 || echo "Failed to save. Is dev-ctx installed? Run: npm install -g @npm_lee/dev-ctx"`

Context has been saved and synced. You can resume this session later with `/dev-ctx-resume` — on this PC or any other device with the same sync config.
```

### 3-2. `~/.claude/skills/dev-ctx-resume/SKILL.md`

```markdown
---
name: dev-ctx-resume
description: Resume a previous development session by loading saved context (local or remote)
argument-hint: "[context-id]"
disable-model-invocation: true
---

# Resume Development Context

Below is the saved development context from a previous session. If the context is not found locally, it will be fetched from the remote server automatically.

!`dev-ctx prompt $ARGUMENTS --stdout --no-copy`

## Instructions

- Read the context above carefully
- Understand the git state, project info, and developer notes
- Continue the work from where it was left off
- If there are changed files mentioned, read them first to understand current state
- Ask clarifying questions if the context is ambiguous
```

### 3-3. `~/.claude/commands/dev-ctx-save.md`

```markdown
# Save Development Context

Save the current development context with the provided memo. If remote sync is configured, the context is automatically pushed to the remote server for cross-device access.

!`dev-ctx save --auto --sync -m "$ARGUMENTS" 2>&1 || echo "Failed to save. Is dev-ctx installed? Run: npm install -g @npm_lee/dev-ctx"`

Context has been saved and synced. You can resume this session later with `/dev-ctx-resume` — on this PC or any other device with the same sync config.
```

### 3-4. `~/.claude/commands/dev-ctx-resume.md`

```markdown
# Resume Development Context

Below is the saved development context from a previous session. If the context is not found locally, it will be fetched from the remote server automatically.

!`dev-ctx prompt $ARGUMENTS --stdout --no-copy 2>/dev/null || echo "No context found. Run 'dev-ctx save -m \"memo\"' first to save a context."`

## Instructions

- Read the context above carefully
- Understand the git state, project info, and developer notes
- Continue the work from where it was left off
- If there are changed files mentioned, read them first to understand current state
```

## 4. Claude Code 권한 설정

`~/.claude/settings.local.json`의 `permissions.allow` 배열에 추가:

```json
"Bash(dev-ctx:*)"
```

## 5. 동작 확인

```bash
# 원격 목록 조회 — 데스크탑에서 저장한 컨텍스트가 보여야 함
dev-ctx list --remote

# 원격 컨텍스트로 프롬프트 생성
dev-ctx prompt <context-id> --stdout --no-copy

# 노트북에서 새 컨텍스트 저장 + 동기화
dev-ctx save -m "notebook test" --auto
```

## 빠른 복붙용 (전체 셋업 스크립트)

```bash
# 설치 + 설정
npm install -g @npm_lee/dev-ctx
dev-ctx config set syncUrl https://dev-ctx-api.dongjunjwa4020.workers.dev
dev-ctx config set apiKey 0yAlSZapYeznUT3JxsKpQLY-N6XLOfqg

# 스킬 디렉토리 생성
mkdir -p ~/.claude/skills/dev-ctx-save
mkdir -p ~/.claude/skills/dev-ctx-resume
mkdir -p ~/.claude/commands

# 파일 생성 (위 3-1 ~ 3-4 내용을 각 파일에 붙여넣기)
```
