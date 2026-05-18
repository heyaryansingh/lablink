import chalk from 'chalk';

export const colors = {
  bg: '#0a0c10',
  surface: '#12151c',
  surface2: '#1a1e28',
  border: '#252a36',
  text: '#e2e4e9',
  textDim: '#8b90a0',
  textMuted: '#555a6e',
  accent: '#4ee1a0',
  accentDim: '#1a3d2e',
  accent2: '#7b93ff',
  accent3: '#ff7b93',
  accent4: '#ffd97b',
  white: '#ffffff',
} as const;

export const textStyle = {
  header: (value: string) => chalk.bold.hex(colors.text)(value.toUpperCase()),
  subheader: (value: string) => chalk.bold.hex(colors.text)(value),
  label: (value: string) => chalk.hex(colors.textDim)(value),
  value: (value: string) => chalk.hex(colors.text)(value),
  muted: (value: string) => chalk.hex(colors.textMuted)(value),
  accent: (value: string) => chalk.hex(colors.accent)(value),
  info: (value: string) => chalk.hex(colors.accent2)(value),
  warn: (value: string) => chalk.hex(colors.accent4)(value),
  error: (value: string) => chalk.hex(colors.accent3)(value),
};

export interface SymbolSet {
  active: string;
  inactive: string;
  unread: string;
  read: string;
  done: string;
  blocked: string;
  warning: string;
  critical: string;
  separator: string;
  project: string;
  meeting: string;
  animal: string;
  document: string;
  ai: string;
}

export const unicodeSymbols: SymbolSet = {
  active: '>',
  inactive: ' ',
  unread: '*',
  read: 'o',
  done: 'x',
  blocked: '!',
  warning: '!',
  critical: '!',
  separator: '|',
  project: 'P',
  meeting: 'M',
  animal: 'A',
  document: 'D',
  ai: '?',
};

export const asciiSymbols: SymbolSet = {
  active: '>',
  inactive: ' ',
  unread: '*',
  read: 'o',
  done: 'x',
  blocked: '!',
  warning: '!',
  critical: '!',
  separator: '|',
  project: 'P',
  meeting: 'M',
  animal: 'A',
  document: 'D',
  ai: '?',
};

export function symbols(ascii = false): SymbolSet {
  return ascii ? asciiSymbols : unicodeSymbols;
}

export function priorityColor(priority: string): typeof colors[keyof typeof colors] {
  switch (priority) {
    case 'critical':
      return colors.accent3;
    case 'high':
      return colors.accent4;
    case 'medium':
      return colors.accent2;
    default:
      return colors.textDim;
  }
}
