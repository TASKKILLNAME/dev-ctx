import { Command } from 'commander';
import { input } from '@inquirer/prompts';
import { buildContext } from '../core/context-builder.js';
import { parseMemos } from '../core/memo-manager.js';
import { saveContext } from '../storage/context-store.js';
import { isRemoteConfigured, pushContext } from '../storage/remote-store.js';
import { logger } from '../utils/logger.js';

export const saveCommand = new Command('save')
  .description('Save current development context')
  .option('-m, --memo <memo>', 'Quick memo (skip interactive prompt)')
  .option('-l, --label <label>', 'Custom label for the context')
  .option('--auto', 'Auto-save without prompts')
  .option('--sync', 'Force push to remote after saving')
  .action(async (opts: { memo?: string; label?: string; auto?: boolean; sync?: boolean }) => {
    try {
      let memoInputs: string[] = [];

      if (opts.memo) {
        memoInputs = [opts.memo];
      } else if (!opts.auto) {
        const memoText = await input({
          message: 'Add a memo (or press Enter to skip):',
          default: '',
        });
        if (memoText.trim()) {
          memoInputs = [memoText];
        }
      }

      const memos = parseMemos(memoInputs);
      const ctx = await buildContext({
        label: opts.label,
        memos,
      });

      const filePath = await saveContext(ctx);
      logger.success(`Context saved: ${ctx.id}`);
      logger.dim(`  Label: ${ctx.label}`);
      logger.dim(`  File: ${filePath}`);

      if (ctx.git) {
        logger.dim(`  Branch: ${ctx.git.branch} (${ctx.git.status})`);
      }
      if (ctx.project) {
        logger.dim(`  Project: ${ctx.project.name}@${ctx.project.version}`);
      }

      // 원격 동기화
      if (opts.sync || isRemoteConfigured()) {
        if (isRemoteConfigured()) {
          const result = await pushContext(ctx);
          if (result.success) {
            logger.success('  Synced to remote');
          } else {
            logger.warn(`  Remote sync failed: ${result.message}`);
          }
        } else if (opts.sync) {
          logger.warn('  Remote sync not configured. Run: dev-ctx config set syncUrl <url>');
        }
      }
    } catch (err) {
      logger.error(`Failed to save context: ${(err as Error).message}`);
      process.exitCode = 1;
    }
  });
