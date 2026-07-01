# HitchWell

Day, pay, per-diem, mileage, multi-state, and cert tracking for oil and gas
contractors. Expo Router + React Native + TypeScript, local-first.

## What's in this build

Four tabs and the screens behind them, all wired to a local persisted store:

- Money (home): YTD income, tax set-aside, net, income-by-state split, days out,
  per-diem days, mileage, next expiring cert. Amounts blurred on launch, Face ID
  to reveal.
- Log: day-by-day logbook with a "tap to log today" nudge; tap any day to edit.
- States: per-state income allocation with a nonresident-filing note.
- More: Expenses, Mileage, Certs & tickets, CSV export, Settings.
- Log a day sheet: date, type (worked/travel/standby/off), rate, state, location,
  per diem. Add and edit.

## Setup

Assumes an Expo Router project (SDK 50+). If starting fresh:

```bash
npx create-expo-app@latest hitchwell --template tabs
cd hitchwell
```

Then copy these files in, replacing the starter app/ files, keeping structure:

```
app.json
app/_layout.tsx
app/(tabs)/_layout.tsx
app/(tabs)/index.tsx        # Money home
app/(tabs)/logbook.tsx
app/(tabs)/states.tsx
app/(tabs)/more.tsx
app/entry.tsx               # log-a-day sheet (modal)
app/expenses.tsx
app/mileage.tsx
app/certs.tsx
app/settings.tsx
components/AmountText.tsx
components/Chip.tsx
context/PrivacyContext.tsx
lib/store.ts
lib/calc.ts
lib/format.ts
lib/exportCsv.ts
theme/colors.ts
```

## Install dependencies

```bash
npx expo install expo-blur expo-local-authentication @react-native-async-storage/async-storage @react-native-community/datetimepicker expo-print expo-sharing expo-image-picker expo-file-system expo-status-bar react-native-safe-area-context
npm install zustand
```

`expo-router` and `@expo/vector-icons` ship with the tabs template.

## Face ID (iOS)

The Face ID permission string is already wired in `app.json` via the
`expo-local-authentication` plugin. Rebuild a dev client (`npx expo prebuild`
then run, or an EAS dev build) — Expo Go won't pick up the native permission.
Face ID needs a real device or a Simulator with an enrolled face. Without
biometrics enrolled, amounts reveal without a prompt (fail-open).

## Run and test

```bash
npx expo start
```

Open Settings (More → Settings) and tap "Load sample data" to populate the
screens, or just start logging days. Data persists locally between launches.

## What's real vs. not

Real: navigation, the full local data model with persistence, add/edit/delete
across days/expenses/mileage/certs, all rollups (income, by-state, per-diem days,
mileage, cert status), the privacy blur + Face ID flow, and a CSV export shared
as text.

Placeholder / next layer:

- Tax math is a flat set-aside percentage (Settings), NOT a tax calculation. Per
  diem is a day count, not GSA rates. Multi-state is an income split, not a
  nonresident-return computation. This engine needs CPA-validated rules before it
  informs anyone's filing.
- No cloud: data lives only on the device. Supabase sync / multi-device is next.
- Receipt photos, cert push-notifications, a native date picker, and a true
  .csv file export (vs shared text) are not built yet.
- IRS mileage rate and the set-aside % are user-entered in Settings — verify the
  mileage rate with the IRS each tax year.

## Before launch

Confirm the name in App Store Connect (create the app record to reserve it),
run "HitchWell" through USPTO TESS, and grab hitchwell.com and the social handle.

## Refreshing GSA per diem data

The per-diem M&IE rates live in `lib/perdiemData.ts` (296 non-standard areas for
FY2026, generated from GSA's official master file). M&IE auto-fills on the day
entry when the logged location matches an area; everything else uses the standard
$68. GSA publishes new rates each August, effective October 1. To refresh:

1. Download the Per Diem Master Rates File from
   https://www.gsa.gov/travel/plan-book/per-diem-rates/per-diem-files
2. `npm i -D xlsx`
3. `node scripts/import-perdiem.mjs ~/Downloads/FY20XX_PerDiemMasterRatesFile.xlsx`

That overwrites `lib/perdiemData.ts`. The standard CONUS rate and M&IE tiers in
`lib/perdiem.ts` are separate; update those if GSA changes them (held flat for
FY2026 at $110 lodging / $68 M&IE).

