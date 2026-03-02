import { Command } from 'commander';
import { confirm } from '@inquirer/prompts';
import { deleteContext, loadContext } from '../storage/context-store.js';
import { isRemoteConfigured, deleteRemoteContext } from '../storage/remote-store.js';
import { logger } from '../utils/logger.js';

export const deleteCommand = new Command('delete')
  .alias('rm')
  .description('Delete a saved context')
  .argument('<id>', 'Context ID to delete')
  .option('-f, --force', 'Skip confirmation')
  .action(async (id: string, opts: { force?: boolean }) => {
    try {
      const ctx = await loadContext(id);
      if (!ctx) {
        logger.error(`Context not found: ${id}`);
        process.exitCode = 1;
        return;
      }

      if (!opts.force) {
        const ok = await confirm({
          message: `Delete context "${ctx.label}" (${ctx.id})?`,
          default: false,
        });
        if (!ok) {
          logger.info('Cancelled.');
          return;
        }
      }

      const deleted = await deleteContext(id);
      if (deleted) {
        logger.success(`Deleted context: ${ctx.label} (${ctx.id})`);
      } else {
        logger.error('Failed to delete context.');
        process.exitCode = 1;
      }

      // 원격에서도 삭제
      if (isRemoteConfigured()) {
        const result = await deleteRemoteContext(id);
        if (result.success) {
          logger.success('  Deleted from remote');
        } else {
          logger.warn(`  Remote delete failed: ${result.message}`);
        }
      }
    } catch (err) {
      logger.error(`Failed to delete context: ${(err as Error).message}`);
      process.exitCode = 1;
    }
  });
