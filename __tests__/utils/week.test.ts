import { clampScore, formatDelta, formatScore, getWeekStart, isCurrentWeek } from '../../src/utils/week';

describe('week utils', () => {
  it('clamps and rounds scores to half steps', () => {
    expect(clampScore(5.24)).toBe(5);
    expect(clampScore(5.3)).toBe(5.5);
    expect(clampScore(-1)).toBe(0);
    expect(clampScore(99)).toBe(10);
  });

  it('formats scores and deltas', () => {
    expect(formatScore(7)).toBe('7');
    expect(formatScore(7.5)).toBe('7.5');
    expect(formatDelta(1.5)).toBe('+1.5');
    expect(formatDelta(-0.5)).toBe('-0.5');
    expect(formatDelta(0)).toBe('0');
  });

  it('uses Monday week starts', () => {
    const week = getWeekStart(new Date('2026-08-13T12:00:00')); // Thursday
    expect(week).toBe('2026-08-10');
    expect(isCurrentWeek(week)).toBe(getWeekStart() === week);
  });
});
