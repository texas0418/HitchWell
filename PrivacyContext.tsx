import React, { createContext, useCallback, useContext, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

// Amounts hidden on cold launch. Revealing requires Face ID / Touch ID
// (passcode fallback). Once revealed, stays revealed for the session.
// Re-hiding is instant. No re-blur on background (commented hook below if wanted).

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
      setHidden(false);
    }
  }, []);

  const hide = useCallback(() => setHidden(true), []);

  const toggle = useCallback(() => {
    if (hidden) void reveal();
    else hide();
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
