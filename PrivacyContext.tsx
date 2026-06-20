import React, { createContext, useCallback, useContext, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

// Privacy model (per spec):
//  - Amounts are HIDDEN (blurred) on every cold launch.
//  - Revealing requires Face ID / Touch ID (passcode fallback).
//  - Once revealed, amounts stay revealed for the rest of the session.
//  - Re-hiding is instant (no auth). Re-revealing prompts biometrics again.
//
// "Session" = while this JS context lives. State is in-memory, so a cold
// app start resets it to hidden automatically — exactly what we want.
//
// OPTIONAL (not enabled, per your call): to also re-blur when the app is
// sent to the background, add an AppState listener here that calls hide()
// on 'background'. Left out because you wanted reveal to persist the session.

type PrivacyValue = {
  hidden: boolean;
  toggle: () => void;
  reveal: () => Promise<void>;
  hide: () => void;
};

const PrivacyContext = createContext<PrivacyValue | undefined>(undefined);

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(true);

  const reveal = useCallback(async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      // No biometrics available/enrolled → fall back to revealing directly
      // rather than locking the user out of their own data.
      if (!hasHardware || !enrolled) {
        setHidden(false);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Show amounts',
        fallbackLabel: 'Use passcode',
      });

      if (result.success) setHidden(false);
    } catch {
      // If auth throws for any reason, fail open to the value rather than
      // trapping the user. Adjust to fail closed if you prefer.
      setHidden(false);
    }
  }, []);

  const hide = useCallback(() => setHidden(true), []);

  const toggle = useCallback(() => {
    if (hidden) {
      void reveal();
    } else {
      hide();
    }
  }, [hidden, reveal, hide]);

  return (
    <PrivacyContext.Provider value={{ hidden, toggle, reveal, hide }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy(): PrivacyValue {
  const ctx = useContext(PrivacyContext);
  if (!ctx) throw new Error('usePrivacy must be used within a PrivacyProvider');
  return ctx;
}
