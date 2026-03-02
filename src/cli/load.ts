import { Command } from 'commander';
import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import { listContexts, loadContext } from '../storage/context-store.js';
import { formatDate, formatList } from '../utils/formatter.js';
import { logger } from '../utils/logger.js';

export const loadCommand = new Command('load')
  .description('Load and display a saved context')
  .argument('[id]', 'Context ID to load')
  .action(async (id?: string) => {
    try {
      let ctx;

      if (id) {
        ctx = await loadContext(id);
        if (!ctx) {
          logger.error(`Context not found: ${id}`);
          process.exitCode = 1;
          return;
        }
      } else {
        const contexts = await listContexts();
        if (contexts.length === 0) {
          logger.warn('No saved contexts found.');
          return;
        }

        const chosen = await select({
          message: 'Select a context to load:',
          choices: contexts.map((c) => ({
            name: `${c.label} (${formatDate(c.createdAt)})`,
            value: c.id,
          })),
        });

        ctx = await loadContext(chosen);
        if (!ctx) {
          logger.error('Failed to load selected context.');
          process.exitCode = 1;
          return;
        }
      }

      console.log();
      console.log(chalk.bold(`Context: ${ctx.label}`));
      console.log(chalk.dim(`ID: ${ctx.id} | Saved: ${formatDate(ctx.createdAt)}`));
      console.log(chalk.dim(`Directory: ${ctx.workingDirectory}`));
      console.log();

      if (ctx.git) {
        console.log(chalk.cyan('Git:'));
        console.log(`  Branch: ${ctx.git.branch}`);
        console.log(`  Status: ${ctx.git.status}`);
        if (ctx.git.changedFiles.length > 0) {
          console.log('  Changed files:');
          console.log(formatList(ctx.git.changedFiles, 4));
        }
        if (ctx.git.recentCommits.length > 0) {
          console.log('  Recent commits:');
          console.log(formatList(ctx.git.recentCommits, 4));
        }
        console.log();
      }

      if (ctx.project) {
        console.log(chalk.cyan('Project:'));
        console.log(`  ${ctx.project.name}@${ctx.project.version}`);
        if (ctx.project.description) {
          console.log(`  ${ctx.project.description}`);
        }
        console.log();
      }

      if (ctx.memos.length > 0) {
        console.log(chalk.cyan('Memos:'));
        for (const memo of ctx.memos) {
          console.log(`  ${memo.content}`);
          if (memo.tags.length > 0) {
            console.log(chalk.dim(`    Tags: ${memo.tags.join(', ')}`));
          }
        }
      }
    } catch (err) {
      logger.error(`Failed to load context: ${(err as Error).message}`);
      process.exitCode = 1;
    }
  });
