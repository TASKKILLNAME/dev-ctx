import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';
import type { DevContext } from '../types/context.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadTemplate(name: string): Promise<string> {
  // Try multiple possible template locations
  const candidates = [
    join(__dirname, '..', '..', 'templates', `${name}.hbs`),  // from dist/
    join(__dirname, '..', 'templates', `${name}.hbs`),         // from src/
    join(process.cwd(), 'templates', `${name}.hbs`),           // from cwd
  ];

  for (const path of candidates) {
    try {
      return await readFile(path, 'utf-8');
    } catch {
      // try next
    }
  }

  throw new Error(`Template "${name}" not found. Searched: ${candidates.join(', ')}`);
}

Handlebars.registerHelper('join', (arr: string[], sep: string) =>
  Array.isArray(arr) ? arr.join(typeof sep === 'string' ? sep : ', ') : '',
);

Handlebars.registerHelper('ifPresent', function (this: unknown, value: unknown, options: Handlebars.HelperOptions) {
  return value ? options.fn(this) : options.inverse(this);
});

export async function generatePrompt(
  context: DevContext,
  templateName = 'claude-resume',
): Promise<string> {
  const source = await loadTemplate(templateName);
  const template = Handlebars.compile(source);
  return template(context);
}
