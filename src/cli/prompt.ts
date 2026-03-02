import { Command } from 'commander';
import { select } from '@inquirer/prompts';
import { listContexts, loadContext } from '../storage/context-store.js';
import { isRemoteConfigured, pullContext, pullContexts } from '../storage/remote-store.js';
import { generatePrompt } from '../core/prompt-generator.js';
import { formatDate } from '../utils/formatter.js';
import { logger } from '../utils/logger.js';

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    const { default: clipboardy } = await import('clipboardy');
    await clipboardy.write(text);
    return true;
  } catch {
    return false;
  }
}

export const promptCommand = new Command('prompt')
  .description('Generate a resume prompt from a saved context')
  .argument('[id]', 'Context ID')
  .option('-t, --template <name>', 'Template name', 'claude-resume')
  .option('--no-copy', 'Skip clipboard copy')
  .option('--stdout', 'Print prompt to stdout')
  .action(
    async (
      id: string | undefined,
      opts: { template: string; copy: boolean; stdout?: boolean },
    ) => {
      try {
        let contextId = id;

        if (!contextId) {
          // 로컬 + 원격 통합 목록
          const localContexts = await listContexts();
          const localIds = new Set(localContexts.map((c) => c.id));

          type Choice = { name: string; value: string; source: string };
          const choices: Choice[] = localContexts.map((c) => ({
            name: `${c.label} (${formatDate(c.createdAt)})`,
            value: c.id,
            source: 'local',
          }));

          if (isRemoteConfigured()) {
            try {
              const remoteMetas = await pullContexts();
              for (const m of remoteMetas) {
                if (!localIds.has(m.id)) {
                  choices.push({
                    name: `${m.label} (${formatDate(m.createdAt)}) [remote]`,
                    value: m.id,
                    source: 'remote',
                  });
                }
              }
            } catch {
              logger.warn('Failed to fetch remote contexts');
            }
          }

          if (choices.length === 0) {
            logger.warn('No saved contexts found.');
            return;
          }

          contextId = await select({
            message: 'Select a context for prompt generation:',
            choices: choices.map((c) => ({ name: c.name, value: c.value })),
          });
        }

        // 로컬에서 먼저 로드, 없으면 원격에서 pull
        let ctx = await loadContext(contextId);
        if (!ctx && isRemoteConfigured()) {
          logger.dim('  Not found locally, fetching from remote...');
          ctx = await pullContext(contextId);
        }

        if (!ctx) {
          logger.error(`Context not found: ${contextId}`);
          process.exitCode = 1;
          return;
        }

        const prompt = await generatePrompt(ctx, opts.template);

        if (opts.stdout) {
          process.stdout.write(prompt);
          return;
        }

        if (opts.copy) {
          const copied = await copyToClipboard(prompt);
          if (copied) {
            logger.success(
              `Prompt generated and copied to clipboard (${prompt.length} chars)`,
            );
          } else {
            logger.warn(
              'Could not copy to clipboard. Printing to stdout instead:',
            );
            console.log();
            console.log(prompt);
          }
        } else {
          console.log(prompt);
        }
      } catch (err) {
        logger.error(`Failed to generate prompt: ${(err as Error).message}`);
        process.exitCode = 1;
      }
    },
  );
