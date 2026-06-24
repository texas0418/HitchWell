import { fromISO } from './format';

// GSA per-diem engine.
//
// Verified FY2026 figures (Oct 1 2025 - Sep 30 2026), held flat from FY2025,
// per the GSA Per Diem Bulletin FTR 26-01 and the Federal Register notice:
//   standard CONUS lodging = $110, standard M&IE = $68
//   five M&IE tiers: 68, 74, 80, 86, 92
//   first/last travel day = 75% of the M&IE rate
//
// What is NOT bundled here: the ~300 Non-Standard Area (NSA) rates, which vary
// by city/county and by month. Those live in GSA's flat files / API
// (https://www.gsa.gov/travel/plan-book/per-diem-rates -> flat files, or
// api.gsa.gov/travel/perdiem/v2). Drop that data into NSA_RATES to enable true
// location lookup. Until then, lookup() returns the standard CONUS rate and the
// per-day M&IE stays user-editable.

export type PerDiemRate = { lodging: number; mie: number };

export const STANDARD_CONUS_FY: number = 2026;
export const STANDARD_CONUS: PerDiemRate = { lodging: 110, mie: 68 };

export type MieTier = { mie: number; firstLast: number };

// firstLast = 75% of mie (exact for these tiers).
export const MIE_TIERS: MieTier[] = [
  { mie: 68, firstLast: 51.0 },
  { mie: 74, firstLast: 55.5 },
  { mie: 80, firstLast: 60.0 },
  { mie: 86, firstLast: 64.5 },
  { mie: 92, firstLast: 69.0 },
];

// GSA fiscal year: starts Oct 1. Oct/Nov/Dec belong to the next year's FY.
export function fiscalYear(iso: string): number {
  const d = fromISO(iso);
  return d.getMonth() >= 9 ? d.getFullYear() + 1 : d.getFullYear();
}

// 75% first/last-day amount for a given M&IE rate. Uses the published tier
// value when the rate matches a tier, otherwise computes 75%.
export function firstLastMie(mie: number): number {
  const tier = MIE_TIERS.find((t) => t.mie === mie);
  return tier ? tier.firstLast : Math.round(mie * 0.75 * 100) / 100;
}

// Shape for a future NSA snapshot. Keyed by state then area name, with optional
// seasonal lodging bands. Empty for now; lookup falls back to standard CONUS.
export type NsaEntry = {
  area: string;
  mie: number;
  lodging: number;
  seasons?: { start: string; end: string; lodging: number }[]; // mm-dd ranges
};
export const NSA_RATES: Record<string, NsaEntry[]> = {};

// Returns the applicable lodging + M&IE for a location and date. Falls back to
// standard CONUS when no NSA snapshot is loaded for that location.
export function lookup(_state: string, _area: string, _iso: string): PerDiemRate {
  // NSA matching goes here once NSA_RATES is populated from GSA flat files.
  return STANDARD_CONUS;
}
