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

// One per-area M&IE record. M&IE does not vary by month within a fiscal year,
// so a single rate per area is all the per-diem auto-fill needs. Lodging is
// tracked as an actual expense, not from this table.
export type NsaArea = {
  state: string;   // 2-letter
  city: string;    // key city / destination
  county?: string;
  mie: number;
};

// Populated by scripts/import-perdiem.mjs from GSA's official flat file.
// Empty until you run the import; lookups fall back to the standard rate.
import { NSA_RATES_DATA } from './perdiemData';

const norm = (s: string) => s.toLowerCase().trim();
const tokens = (s?: string) => (s ? s.split('/').map(norm).filter((t) => t.length >= 3) : []);

// Best-effort match of a free-text location to an NSA area within a state.
// The app stores "City, ST" text, not ZIP/county, so matching is by key-city
// (or county) name appearing in the location string. Multi-city areas like
// "Midland / Odessa" are split so either name resolves.
export function findArea(state: string, location: string): NsaArea | undefined {
  if (!state || !location) return undefined;
  const st = state.toUpperCase();
  const loc = norm(location);
  const inState = NSA_RATES_DATA.filter((a) => a.state.toUpperCase() === st);
  return (
    inState.find((a) => tokens(a.city).some((t) => loc.includes(t))) ||
    inState.find((a) => tokens(a.county).some((t) => loc.includes(t)))
  );
}

// M&IE to suggest for a logged day. Returns the matched area rate, else the
// provided fallback (the user's default, typically the standard $68).
export function mieForLocation(state: string, location: string, fallback: number): number {
  return findArea(state, location)?.mie ?? fallback;
}

// Full lodging + M&IE for a location/date. Lodging stays standard until NSA
// lodging is added to the dataset; M&IE comes from the matched area.
export function lookup(state: string, location: string, _iso: string): PerDiemRate {
  const area = findArea(state, location);
  return { lodging: STANDARD_CONUS.lodging, mie: area?.mie ?? STANDARD_CONUS.mie };
}
