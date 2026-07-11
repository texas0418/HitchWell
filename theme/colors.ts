// HitchWell design tokens — terminal/utility style, light + dark.
// Screens call useTheme() for the active palette. The static `colors` export
// stays as the light palette so not-yet-restyled screens keep compiling.

import { useColorScheme } from 'react-native';

export type AppColors = {
  bg: string;
  ink: string;
  muted: string;
  faint: string;
  hairline: string;
  hairline2: string;
  surface: string;
  border: string;
  accent: string;
  danger: string;
  success: string;
  warn: string;
  warnBg: string;
  warnBorder: string;
  warnText: string;
  onInk: string;
  state: Record<string, string>;
};

export const light: AppColors = {
  bg: '#FFFFFF',
  ink: '#1F1F1D',
  muted: '#5F5E5A',
  faint: '#9A9890',
  hairline: '#ECECEC',
  hairline2: '#F0EFE9',
  surface: '#F7F6F2',
  border: '#D8D6CE',
  accent: '#185FA5',
  danger: '#A32D2D',
  success: '#0F6E56',
  warn: '#854F0B',
  warnBg: '#FAEEDA',
  warnBorder: '#ECD9B0',
  warnText: '#633806',
  onInk: '#FFFFFF',
  state: {
    TX: '#185FA5', NM: '#0F6E56', OK: '#BA7517', ND: '#993C1D',
    CO: '#534AB7', LA: '#993556', PA: '#0C447C', WY: '#3B6D11',
    WV: '#888780', NV: '#085041', CA: '#D85A30', MT: '#27500A',
  },
};

export const dark: AppColors = {
  bg: '#191917',
  ink: '#F1EFE8',
  muted: '#B4B2A9',
  faint: '#7E7D76',
  hairline: '#2A2A27',
  hairline2: '#262623',
  surface: '#222220',
  border: '#3C3C38',
  accent: '#85B7EB',
  danger: '#F09595',
  success: '#5DCAA5',
  warn: '#FAC775',
  warnBg: '#2E2717',
  warnBorder: '#4A3D1D',
  warnText: '#FAC775',
  onInk: '#191917',
  state: {
    TX: '#85B7EB', NM: '#5DCAA5', OK: '#FAC775', ND: '#F0997B',
    CO: '#AFA9EC', LA: '#ED93B1', PA: '#B5D4F4', WY: '#97C459',
    WV: '#B4B2A9', NV: '#9FE1CB', CA: '#F5C4B3', MT: '#C0DD97',
  },
};

// Active palette for the current system appearance.
export function useTheme(): AppColors {
  return useColorScheme() === 'dark' ? dark : light;
}

// Back-compat static export (light). Restyled screens use useTheme() instead.
export const colors = light;

const palette = ['#185FA5', '#0F6E56', '#BA7517', '#534AB7', '#993556', '#993C1D', '#3B6D11', '#888780'];
const paletteDark = ['#85B7EB', '#5DCAA5', '#FAC775', '#AFA9EC', '#ED93B1', '#F0997B', '#97C459', '#B4B2A9'];

export function stateColor(code: string, index = 0, theme?: AppColors): string {
  const t = theme ?? light;
  const fallback = t === dark ? paletteDark : palette;
  return t.state[code] ?? fallback[index % fallback.length];
}
