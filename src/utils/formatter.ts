export function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

export function formatList(items: string[], indent = 2): string {
  const prefix = ' '.repeat(indent);
  return items.map((item) => `${prefix}• ${item}`).join('\n');
}

export function formatTable(
  rows: string[][],
  headers: string[],
): string {
  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] ?? '').length)),
  );

  const sep = colWidths.map((w) => '─'.repeat(w + 2)).join('┼');
  const formatRow = (row: string[]) =>
    row.map((cell, i) => ` ${(cell ?? '').padEnd(colWidths[i])} `).join('│');

  return [formatRow(headers), sep, ...rows.map(formatRow)].join('\n');
}
