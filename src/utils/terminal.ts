export interface TerminalSize {
  columns: number;
  rows: number;
}

export function getTerminalSize(): TerminalSize {
  return {
    columns: process.stdout.columns || 100,
    rows: process.stdout.rows || 30,
  };
}

export function shouldUseAscii(): boolean {
  const value = process.env.LABLINK_ASCII;
  if (value === '1' || value === 'true') return true;
  return process.platform === 'win32' && !process.env.WT_SESSION && !process.env.TERM_PROGRAM;
}

export function clampText(value: string, width: number): string {
  if (width <= 0) return '';
  if (value.length <= width) return value;
  if (width <= 3) return value.slice(0, width);
  return `${value.slice(0, width - 3)}...`;
}
