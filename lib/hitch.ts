import { Profile } from './store';
import { fromISO, toISODate, addDays, todayISO } from './format';

// Rotation engine. The schedule is defined by three profile fields: days on,
// days off, and an anchor date (the first day of any known hitch). Everything
// else is derived by cycling from the anchor. Anchor unset = feature off.

export type HitchStatus = {
  phase: 'on' | 'off';
  dayInPhase: number;      // 1-based
  phaseLength: number;
  nextChange: string;      // ISO date of the next phase boundary
  nextChangeLabel: string; // 'home' | 'back out'
};

export function hitchEnabled(p: Profile): boolean {
  return !!p.hitchAnchor && (p.hitchOnDays || 0) > 0 && (p.hitchOffDays || 0) > 0;
}

// Days between two ISO dates (b - a).
const diffDays = (a: string, b: string) =>
  Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / 86400000);

// Phase for an arbitrary date. Works before the anchor too (mod handles it).
export function phaseFor(p: Profile, iso: string): 'on' | 'off' | null {
  if (!hitchEnabled(p)) return null;
  const cycle = p.hitchOnDays + p.hitchOffDays;
  const offset = ((diffDays(p.hitchAnchor!, iso) % cycle) + cycle) % cycle;
  return offset < p.hitchOnDays ? 'on' : 'off';
}

export function hitchStatus(p: Profile, iso = todayISO()): HitchStatus | null {
  if (!hitchEnabled(p)) return null;
  const cycle = p.hitchOnDays + p.hitchOffDays;
  const offset = ((diffDays(p.hitchAnchor!, iso) % cycle) + cycle) % cycle;

  if (offset < p.hitchOnDays) {
    return {
      phase: 'on',
      dayInPhase: offset + 1,
      phaseLength: p.hitchOnDays,
      nextChange: addDays(iso, p.hitchOnDays - offset),
      nextChangeLabel: 'home',
    };
  }
  const offOffset = offset - p.hitchOnDays;
  return {
    phase: 'off',
    dayInPhase: offOffset + 1,
    phaseLength: p.hitchOffDays,
    nextChange: addDays(iso, p.hitchOffDays - offOffset),
    nextChangeLabel: 'back out',
  };
}

// Scheduled on-phase days remaining in the year, from tomorrow through Dec 31.
// Used for the income projection: earned so far + remaining on-days * rate.
export function remainingOnDays(p: Profile, year: number, from = todayISO()): number {
  if (!hitchEnabled(p)) return 0;
  let count = 0;
  let d = addDays(from, 1);
  const end = `${year}-12-31`;
  let guard = 0;
  while (d <= end && guard < 400) {
    if (phaseFor(p, d) === 'on') count++;
    d = addDays(d, 1);
    guard++;
  }
  return count;
}
