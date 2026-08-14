import { startOfWeek, format, parseISO, addWeeks, isAfter } from 'date-fns';

/** Monday-based week key used for weekly check-ins */
export function getWeekStart(date: Date = new Date()): string {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

export function formatWeekLabel(weekStart: string): string {
  const start = parseISO(weekStart);
  const end = addWeeks(start, 1);
  end.setDate(end.getDate() - 1);
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;
}

export function isCurrentWeek(weekStart: string): boolean {
  return weekStart === getWeekStart();
}

export function clampScore(value: number, min = 0, max = 10): number {
  const rounded = Math.round(value * 2) / 2;
  return Math.min(max, Math.max(min, rounded));
}

export function formatScore(score: number): string {
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}

export function formatDelta(delta: number): string {
  if (delta === 0) return '0';
  const sign = delta > 0 ? '+' : '';
  return `${sign}${formatScore(delta)}`;
}

export function needsWeeklyCheckIn(lastRatedWeek: string | null | undefined): boolean {
  if (!lastRatedWeek) return true;
  return !isCurrentWeek(lastRatedWeek);
}

export function nextWeekStart(weekStart: string): string {
  return format(addWeeks(parseISO(weekStart), 1), 'yyyy-MM-dd');
}

export function isFutureWeek(weekStart: string): boolean {
  return isAfter(parseISO(weekStart), parseISO(getWeekStart()));
}
