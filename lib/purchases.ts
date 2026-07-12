import { Alert } from 'react-native';
import { useStore } from './store';

// RevenueCat wrapper for the one-time Pro unlock ($19.99 non-consumable).
// Product: 'hitchwell_pro' — Entitlement: 'pro'.
//
// Lazy-loaded: react-native-purchases is a native module that only exists in
// builds made after it's installed. When absent, canGate() is false and every
// export stays free — the app must never lock content without a working way
// to pay.
//
// SETUP (one time): create the app + product in RevenueCat, then paste the
// public iOS SDK key below.
const REVENUECAT_IOS_KEY = 'appl_oVUOzpUKfFqTUTUXPqNJEkujeaK';
const ENTITLEMENT = 'HitchWell Pro'; // must match the RevenueCat entitlement Identifier exactly

let Purchases: typeof import('react-native-purchases').default | null = null;
let configured = false;
let checked = false;

function getPurchases() {
  if (checked) return Purchases;
  checked = true;
  if (REVENUECAT_IOS_KEY.startsWith('REPLACE')) return null; // not set up yet
  try {
    Purchases = require('react-native-purchases').default;
    return Purchases;
  } catch {
    return null; // native module absent in this build
  }
}

async function ensureConfigured() {
  const P = getPurchases();
  if (!P) return null;
  if (!configured) {
    P.configure({ apiKey: REVENUECAT_IOS_KEY });
    configured = true;
  }
  return P;
}

// Whether the paywall can be enforced at all in this build.
export function canGate(): boolean {
  return getPurchases() !== null;
}

// Refresh entitlement from RevenueCat and cache it in the store.
export async function refreshPro(): Promise<boolean> {
  const P = await ensureConfigured();
  if (!P) return true; // no purchase system => treat as unlocked
  try {
    const info = await P.getCustomerInfo();
    const owned = !!info.entitlements.active[ENTITLEMENT];
    useStore.getState().setProUnlocked(owned);
    return owned;
  } catch {
    return useStore.getState().proUnlocked; // offline: trust the cache
  }
}

export async function purchasePro(): Promise<boolean> {
  const P = await ensureConfigured();
  if (!P) {
    Alert.alert('Purchases not live yet', 'The store is not configured in this build. Exports are free until it is.');
    return false;
  }
  try {
    const offerings = await P.getOfferings();
    const pkg = offerings.current?.availablePackages?.[0];
    if (!pkg) {
      Alert.alert('Store unavailable', 'Could not load the product. Try again later.');
      return false;
    }
    const { customerInfo } = await P.purchasePackage(pkg);
    const owned = !!customerInfo.entitlements.active[ENTITLEMENT];
    useStore.getState().setProUnlocked(owned);
    return owned;
  } catch (e: unknown) {
    const err = e as { userCancelled?: boolean };
    if (!err.userCancelled) Alert.alert('Purchase failed', 'The purchase could not be completed.');
    return false;
  }
}

export async function restorePro(): Promise<boolean> {
  const P = await ensureConfigured();
  if (!P) {
    Alert.alert('Purchases not live yet', 'The store is not configured in this build. Exports are free until it is.');
    return false;
  }
  try {
    const info = await P.restorePurchases();
    const owned = !!info.entitlements.active[ENTITLEMENT];
    useStore.getState().setProUnlocked(owned);
    Alert.alert(owned ? 'Restored' : 'Nothing to restore', owned ? 'HitchWell Pro is unlocked.' : 'No previous purchase found for this Apple ID.');
    return owned;
  } catch {
    Alert.alert('Restore failed', 'Could not reach the App Store.');
    return false;
  }
}

// Gate check used by export buttons. Returns true when the action may
// proceed; false means the paywall should be shown.
export function mayExport(): boolean {
  if (!canGate()) return true;           // purchases not live in this build
  return useStore.getState().proUnlocked; // cached entitlement (refreshed on launch)
}
