import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

/**
 * Format a date string as "MMM d, yyyy" e.g. "Jan 5, 2025"
 */
export function formatDate(dateStr: string): string {
  const d = parseISO(dateStr);
  return isValid(d) ? format(d, 'MMM d, yyyy') : dateStr;
}

/**
 * Format a date string as "MMM d, yyyy h:mm a"
 */
export function formatDateTime(dateStr: string): string {
  const d = parseISO(dateStr);
  return isValid(d) ? format(d, 'MMM d, yyyy h:mm a') : dateStr;
}

/**
 * Relative time e.g. "3 days ago"
 */
export function timeAgo(dateStr: string): string {
  const d = parseISO(dateStr);
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : dateStr;
}

/**
 * Format a month key "YYYY-MM" as "Jan 2025"
 */
export function formatMonth(monthStr: string): string {
  const d = parseISO(`${monthStr}-01`);
  return isValid(d) ? format(d, 'MMM yyyy') : monthStr;
}

/**
 * Get today's date as "YYYY-MM-DD" for date input default values
 */
export function todayIso(): string {
  return new Date().toISOString().split('T')[0] || '';
}
