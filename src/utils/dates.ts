import { format, parseISO, differenceInCalendarDays } from 'date-fns';

export function nowIso(): string {
  return new Date().toISOString();
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(value: string | null | undefined, pattern = 'MMM d'): string {
  if (!value) return 'No date';
  return format(parseISO(value.length === 10 ? `${value}T12:00:00.000Z` : value), pattern);
}

export function formatRelativeDue(value: string | null | undefined): string {
  if (!value) return 'No deadline';
  const days = differenceInCalendarDays(parseISO(`${value.slice(0, 10)}T12:00:00.000Z`), new Date());
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days}d`;
}
