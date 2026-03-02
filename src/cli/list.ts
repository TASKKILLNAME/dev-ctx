import { Command } from 'commander';
import chalk from 'chalk';
import { listContexts } from '../storage/context-store.js';
import { isRemoteConfigured, pullContexts } from '../storage/remote-store.js';
import { formatDate, truncate, formatTable } from '../utils/formatter.js';
import { logger } from '../utils/logger.js';

export const listCommand = new Command('list')
  .alias('ls')
  .description('List all saved contexts')
  .option('-n, --limit <count>', 'Limit number of results', '20')
  .option('--remote', 'Show remote contexts only')
  .action(async (opts: { limit: string; remote?: boolean }) => {
    try {
      const limit = parseInt(opts.limit, 10) || 20;
      const hasRemote = isRemoteConfigured();

      if (opts.remote) {
        if (!hasRemote) {
          logger.warn('Remote sync not configured. Run: dev-ctx config set syncUrl <url>');
          return;
        }

        const remoteList = await pullContexts();
        if (remoteList.length === 0) {
          logger.warn('No remote contexts found.');
          return;
        }

        const shown = remoteList.slice(0, limit);
        const headers = ['ID', 'Label', 'Branch', 'Date'];
        const rows = shown.map((m) => [
          m.id,
          truncate(m.label, 30),
          m.branch ?? '-',
          formatDate(m.createdAt),
        ]);

        console.log();
        console.log(chalk.bold(`Remote contexts (${remoteList.length} total):`));
        console.log();
        console.log(formatTable(rows, headers));

        if (remoteList.length > limit) {
          console.log();
          logger.dim(`  ... and ${remoteList.length - limit} more`);
        }
        return;
      }

      // 로컬 목록
      const contexts = await listContexts();
      const localIds = new Set(contexts.map((c) => c.id));

      // 원격 목록 (설정되어 있으면)
      let remoteOnlyIds: Set<string> = new Set();
      let remoteMetas: Array<{ id: string; label: string; branch: string | null; createdAt: string }> = [];
      if (hasRemote) {
        try {
          remoteMetas = await pullContexts();
          remoteOnlyIds = new Set(
            remoteMetas.filter((m) => !localIds.has(m.id)).map((m) => m.id),
          );
        } catch {
          logger.warn('Failed to fetch remote contexts');
        }
      }

      const totalCount = contexts.length + remoteOnlyIds.size;
      if (totalCount === 0) {
        logger.warn('No saved contexts found.');
        return;
      }

      // 테이블 구성
      const showSource = hasRemote && remoteMetas.length > 0;
      const headers = showSource
        ? ['ID', 'Label', 'Branch', 'Date', 'Memos', 'Source']
        : ['ID', 'Label', 'Branch', 'Date', 'Memos'];

      const rows: string[][] = [];

      // 로컬 컨텍스트
      const remoteIds = new Set(remoteMetas.map((m) => m.id));
      for (const ctx of contexts.slice(0, limit)) {
        const source = remoteIds.has(ctx.id) ? 'local+remote' : 'local';
        const row = [
          ctx.id,
          truncate(ctx.label, 30),
          ctx.git?.branch ?? '-',
          formatDate(ctx.createdAt),
          String(ctx.memos.length),
        ];
        if (showSource) row.push(source);
        rows.push(row);
      }

      // 원격 전용
      const remaining = limit - rows.length;
      if (remaining > 0) {
        const remoteOnly = remoteMetas.filter((m) => remoteOnlyIds.has(m.id));
        for (const m of remoteOnly.slice(0, remaining)) {
          const row = [
            m.id,
            truncate(m.label, 30),
            m.branch ?? '-',
            formatDate(m.createdAt),
            '-',
          ];
          if (showSource) row.push('remote');
          rows.push(row);
        }
      }

      console.log();
      console.log(chalk.bold(`Saved contexts (${totalCount} total):`));
      console.log();
      console.log(formatTable(rows, headers));

      if (totalCount > limit) {
        console.log();
        logger.dim(`  ... and ${totalCount - limit} more`);
      }
    } catch (err) {
      logger.error(`Failed to list contexts: ${(err as Error).message}`);
      process.exitCode = 1;
    }
  });
