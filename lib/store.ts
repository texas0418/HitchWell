import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Types ---

export type DayType = 'worked' | 'travel' | 'standby' | 'off';

export type DayEntry = {
  id: string;
  date: string;        // ISO yyyy-mm-dd
  type: DayType;
  rate: number;        // dollars for that day (0 for off)
  state: string;       // 2-letter, '' if none (e.g. travel/off)
  location: string;
  perDiem: boolean;
  perDiemAmount?: number;  // M&IE dollars applied that day (75% on travel days)
  client?: string;
};

export type ExpenseCategory =
  | 'fuel' | 'lodging' | 'tools' | 'ppe' | 'meals'
  | 'airfare' | 'taxi' | 'rideshare' | 'parking' | 'rental' | 'tolls' | 'baggage'
  | 'other';

// label + whether this category is, by default, a cost you get reimbursed for
// (vs your own tax-deductible cost). The user can override per expense.
export const EXPENSE_CATEGORIES: { key: ExpenseCategory; label: string; reimbursable: boolean }[] = [
  { key: 'airfare', label: 'Airfare', reimbursable: true },
  { key: 'taxi', label: 'Taxi', reimbursable: true },
  { key: 'rideshare', label: 'Rideshare', reimbursable: true },
  { key: 'rental', label: 'Rental car', reimbursable: true },
  { key: 'parking', label: 'Parking', reimbursable: true },
  { key: 'tolls', label: 'Tolls', reimbursable: true },
  { key: 'baggage', label: 'Baggage', reimbursable: true },
  { key: 'lodging', label: 'Lodging', reimbursable: true },
  { key: 'fuel', label: 'Fuel', reimbursable: false },
  { key: 'meals', label: 'Meals', reimbursable: false },
  { key: 'tools', label: 'Tools', reimbursable: false },
  { key: 'ppe', label: 'PPE', reimbursable: false },
  { key: 'other', label: 'Other', reimbursable: false },
];

export const CATEGORY_LABEL: Record<ExpenseCategory, string> = EXPENSE_CATEGORIES.reduce(
  (acc, c) => ((acc[c.key] = c.label), acc),
  {} as Record<ExpenseCategory, string>
);

export type Expense = {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  reimbursable: boolean;   // true = fronted, paid back by employer (not a deduction)
  client?: string;
  receiptUri?: string;     // local file path to the receipt photo, if attached
  note?: string;
};

export type Mileage = {
  id: string;
  date: string;
  miles: number;
  purpose: string;
  client?: string;
};

export type Cert = {
  id: string;
  name: string;
  expiry: string;      // ISO
};

export type PayPeriod = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly' | 'hitch';

export const PAY_PERIODS: { key: PayPeriod; label: string }[] = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'biweekly', label: 'Biweekly' },
  { key: 'semimonthly', label: 'Semimonthly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'hitch', label: 'By hitch' },
];

export type Profile = {
  name: string;
  defaultDayRate: number;
  mileageRate: number;     // IRS standard mileage rate, $/mile (verify yearly)
  taxSetAsidePct: number;  // placeholder set-aside fraction (NOT a tax calc)
  homeState: string;
  payPeriod: PayPeriod;
  paymentTermsDays: number;  // days from billing to payment, e.g. net-30
  perDiemMie: number;        // default daily M&IE (GSA FY2026 standard = 68)
  businessName: string;      // invoice From block; falls back to name
  businessAddress: string;   // multi-line
  businessPhone: string;
  businessEmail: string;
  paymentInstructions: string; // e.g. "ACH: ... " or "Check payable to ..."

  travelDayRate: number;     // 0 = same as defaultDayRate
  standbyDayRate: number;    // 0 = same as defaultDayRate
  hitchOnDays: number;       // rotation days on (0 = schedule off)
  hitchOffDays: number;      // rotation days off
  hitchAnchor: string;       // ISO first day of any known hitch ('' = off)
};

export type Appearance = 'system' | 'light' | 'dark';

type State = {
  profile: Profile;
  onboarded: boolean;
  appearance: Appearance;
  invoiceCounter: number;
  clients: string[];
  dayEntries: DayEntry[];
  expenses: Expense[];
  mileage: Mileage[];
  certs: Cert[];

  setOnboarded: (v: boolean) => void;
  setAppearance: (a: Appearance) => void;
  bumpInvoiceCounter: () => void;
  addClient: (name: string) => void;
  removeClient: (name: string) => void;

  addDayEntry: (e: Omit<DayEntry, 'id'>) => void;
  updateDayEntry: (id: string, patch: Partial<DayEntry>) => void;
  removeDayEntry: (id: string) => void;

  addExpense: (e: Omit<Expense, 'id'>) => void;
  removeExpense: (id: string) => void;

  addMileage: (m: Omit<Mileage, 'id'>) => void;
  removeMileage: (id: string) => void;

  addCert: (c: Omit<Cert, 'id'>) => void;
  removeCert: (id: string) => void;

  setProfile: (patch: Partial<Profile>) => void;

  loadSample: () => void;
  clearAll: () => void;
};

const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const defaultProfile: Profile = {
  name: '',
  defaultDayRate: 525,
  mileageRate: 0.67,     // verify the current IRS rate each tax year
  taxSetAsidePct: 0.27,  // placeholder only
  homeState: 'TX',
  payPeriod: 'monthly',
  paymentTermsDays: 30,
  perDiemMie: 68,
  businessName: '',
  businessAddress: '',
  businessPhone: '',
  businessEmail: '',
  paymentInstructions: '',
  travelDayRate: 0,
  standbyDayRate: 0,
  hitchOnDays: 28,
  hitchOffDays: 14,
  hitchAnchor: '',
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      onboarded: false,
      appearance: 'system' as Appearance,
      invoiceCounter: 1,
      clients: [],
      dayEntries: [],
      expenses: [],
      mileage: [],
      certs: [],

      setOnboarded: (v) => set(() => ({ onboarded: v })),
      setAppearance: (a) => set(() => ({ appearance: a })),
      bumpInvoiceCounter: () => set((s) => ({ invoiceCounter: (s.invoiceCounter || 1) + 1 })),

      addClient: (name) =>
        set((s) => {
          const n = name.trim();
          if (!n || s.clients.some((c) => c.toLowerCase() === n.toLowerCase())) return {};
          return { clients: [...s.clients, n].sort((a, b) => a.localeCompare(b)) };
        }),
      removeClient: (name) => set((s) => ({ clients: s.clients.filter((c) => c !== name) })),

      addDayEntry: (e) => set((s) => ({ dayEntries: [{ ...e, id: id() }, ...s.dayEntries] })),
      updateDayEntry: (eid, patch) =>
        set((s) => ({ dayEntries: s.dayEntries.map((d) => (d.id === eid ? { ...d, ...patch } : d)) })),
      removeDayEntry: (eid) => set((s) => ({ dayEntries: s.dayEntries.filter((d) => d.id !== eid) })),

      addExpense: (e) => set((s) => ({ expenses: [{ ...e, id: id() }, ...s.expenses] })),
      removeExpense: (eid) => set((s) => ({ expenses: s.expenses.filter((x) => x.id !== eid) })),

      addMileage: (m) => set((s) => ({ mileage: [{ ...m, id: id() }, ...s.mileage] })),
      removeMileage: (mid) => set((s) => ({ mileage: s.mileage.filter((x) => x.id !== mid) })),

      addCert: (c) => set((s) => ({ certs: [{ ...c, id: id() }, ...s.certs] })),
      removeCert: (cid) => set((s) => ({ certs: s.certs.filter((x) => x.id !== cid) })),

      setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),

      loadSample: () =>
        set(() => {
          const today = new Date();
          const iso = (offset: number) => {
            const d = new Date(today);
            d.setDate(d.getDate() - offset);
            return d.toISOString().slice(0, 10);
          };
          return {
            clients: ['AUT Consulting', 'Permian Field Services'],
            dayEntries: [
              { id: id(), date: iso(1), type: 'worked', rate: 525, state: 'TX', location: 'Midland, TX', perDiem: true, perDiemAmount: 68, client: 'AUT Consulting' },
              { id: id(), date: iso(2), type: 'travel', rate: 200, state: '', location: 'mobe', perDiem: false, client: 'AUT Consulting' },
              { id: id(), date: iso(3), type: 'standby', rate: 300, state: 'NM', location: 'weather', perDiem: true, perDiemAmount: 68, client: 'Permian Field Services' },
              { id: id(), date: iso(4), type: 'worked', rate: 525, state: 'TX', location: 'Midland, TX', perDiem: true, perDiemAmount: 68, client: 'AUT Consulting' },
              { id: id(), date: iso(5), type: 'off', rate: 0, state: '', location: '', perDiem: false },
              { id: id(), date: iso(6), type: 'worked', rate: 525, state: 'NM', location: 'Hobbs, NM', perDiem: true, perDiemAmount: 68, client: 'Permian Field Services' },
            ],
            expenses: [
              { id: id(), date: iso(2), category: 'airfare', amount: 420, reimbursable: true, client: 'AUT Consulting', note: 'IAH to MAF' },
              { id: id(), date: iso(2), category: 'rideshare', amount: 32, reimbursable: true, client: 'AUT Consulting', note: 'airport to yard' },
              { id: id(), date: iso(3), category: 'lodging', amount: 110, reimbursable: true, client: 'Permian Field Services', note: 'motel' },
              { id: id(), date: iso(1), category: 'fuel', amount: 84, reimbursable: false, note: 'diesel' },
              { id: id(), date: iso(4), category: 'meals', amount: 38, reimbursable: false },
            ],
            mileage: [{ id: id(), date: iso(2), miles: 412, purpose: 'home to location', client: 'AUT Consulting' }],
            certs: [
              { id: id(), name: 'H2S Alive', expiry: iso(-23) },
              { id: id(), name: 'TWIC', expiry: iso(-120) },
              { id: id(), name: 'SafeLandUSA', expiry: iso(-300) },
            ],
          };
        }),

      clearAll: () => set(() => ({ clients: [], dayEntries: [], expenses: [], mileage: [], certs: [] })),
    }),
    {
      name: 'hitchwell-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 11,
      migrate: (persisted: any, fromVersion: number) => {
        if (!persisted) return persisted;
        if (fromVersion < 2) persisted.onboarded = true;
        if (!persisted.appearance) persisted.appearance = 'system';
        if (!persisted.invoiceCounter) persisted.invoiceCounter = 1;
        persisted.profile = { ...defaultProfile, ...(persisted.profile ?? {}) };
        // Older expenses had no reimbursable flag; default them to deductible.
        if (Array.isArray(persisted.expenses)) {
          persisted.expenses = persisted.expenses.map((e: any) => ({
            reimbursable: false,
            ...e,
          }));
        }
        // Seed the canonical client list from any clients already typed on days.
        if (!Array.isArray(persisted.clients)) {
          const seen = new Set<string>();
          for (const d of persisted.dayEntries ?? []) {
            if (d.client && d.client.trim()) seen.add(d.client.trim());
          }
          persisted.clients = Array.from(seen).sort((a, b) => a.localeCompare(b));
        }
        return persisted;
      },
    }
  )
);

// True once the persisted store has loaded from disk. Use this to avoid
// flashing onboarding to returning users before their data rehydrates.
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(useStore.persist.hasHydrated());
  useEffect(() => {
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useStore.persist.hasHydrated());
    return () => unsub?.();
  }, []);
  return hydrated;
}
