import { describe, it, expect } from 'vitest';
import { createProgram } from '../../src/cli/index.js';

describe('CLI program', () => {
  it('registers all 6 commands', () => {
    const program = createProgram();
    const commandNames = program.commands.map((c) => c.name());

    expect(commandNames).toContain('save');
    expect(commandNames).toContain('load');
    expect(commandNames).toContain('prompt');
    expect(commandNames).toContain('list');
    expect(commandNames).toContain('delete');
    expect(commandNames).toContain('config');
    expect(commandNames).toHaveLength(6);
  });

  it('has correct name and description', () => {
    const program = createProgram();
    expect(program.name()).toBe('dev-ctx');
  });

  it('list command has ls alias', () => {
    const program = createProgram();
    const listCmd = program.commands.find((c) => c.name() === 'list');
    expect(listCmd).toBeTruthy();
    expect(listCmd!.aliases()).toContain('ls');
  });

  it('delete command has rm alias', () => {
    const program = createProgram();
    const delCmd = program.commands.find((c) => c.name() === 'delete');
    expect(delCmd).toBeTruthy();
    expect(delCmd!.aliases()).toContain('rm');
  });
});
