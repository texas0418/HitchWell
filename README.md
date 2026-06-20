# Oilfield Tracker — home page (first build)

The money-forward home screen plus the privacy plumbing and a working logbook
tab, on Expo Router + React Native + TypeScript.

## Drop-in

These files assume an existing Expo Router (SDK 50+) project. Copy the folders
into your project root, keeping structure:

```
app/_layout.tsx
app/(tabs)/_layout.tsx
app/(tabs)/index.tsx       # home (Money)
app/(tabs)/logbook.tsx     # logbook timeline (Log)
app/(tabs)/states.tsx      # placeholder
app/(tabs)/more.tsx        # placeholder
components/AmountText.tsx
context/PrivacyContext.tsx
theme/colors.ts
```

If you're starting fresh:

```bash
npx create-expo-app@latest oilfield-tracker
cd oilfield-tracker
# then copy these files in, replacing the starter app/ files
```

## Install dependencies

```bash
npx expo install expo-blur expo-local-authentication expo-status-bar react-native-safe-area-context
```

`expo-router` and `@expo/vector-icons` ship with the Expo Router template.

## Face ID config (iOS)

`expo-local-authentication` needs a usage string. Add its config plugin to
`app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-local-authentication",
        { "faceIDPermission": "Reveal your income and expense amounts." }
      ]
    ]
  }
}
```

Then rebuild the dev client (`npx expo prebuild` / EAS build) — a plain Expo Go
session won't pick up the new native permission. Face ID only works on a real
device or a Simulator with an enrolled face.

## Run

```bash
npx expo start
```

## Privacy behavior (as specced)

- Amounts are blurred on every cold launch.
- Tapping the eye (top-right of home) or any amount triggers Face ID to reveal.
- Once revealed, amounts stay revealed for the rest of the session.
- Re-hiding is instant; re-revealing prompts Face ID again.
- No re-blur on backgrounding (left off per your call — there's a commented hook
  in `context/PrivacyContext.tsx` if you change your mind).

## What's real vs. mock

- Real: layout, navigation, the privacy/Face ID flow, the blur component.
- Mock: every number and the logbook entries are hardcoded placeholders, marked
  with comments. Next step is wiring these to Supabase (a YTD rollup for the home
  cards, a per-month entries query for the logbook).

## Not built yet

- The day-entry sheet behind "Log today" and behind tapping a logbook day — this
  is the interaction the whole app's accuracy depends on.
- States allocation, certs/tickets, expenses, mileage, and exports.
