import { Command } from 'commander';
import { saveCommand } from './save.js';
import { loadCommand } from './load.js';
import { promptCommand } from './prompt.js';
import { listCommand } from './list.js';
import { deleteCommand } from './delete.js';
import { configCommand } from './config.js';

export function createProgram(): Command {
  const program = new Command();

  program
    .name('dev-ctx')
    .description('Save and restore development context across Claude Code sessions')
    .version('0.1.0');

  program.addCommand(saveCommand);
  program.addCommand(loadCommand);
  program.addCommand(promptCommand);
  program.addCommand(listCommand);
  program.addCommand(deleteCommand);
  program.addCommand(configCommand);

  return program;
}

export async function run(argv?: string[]): Promise<void> {
  const program = createProgram();
  await program.parseAsync(argv ?? process.argv);
}
