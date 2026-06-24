// HitchWell design tokens — money-forward light theme, blue accent, red for tax/alerts.

export const colors = {
  bg: '#FFFFFF',
  ink: '#1F1F1D',
  muted: '#6B6A64',
  faint: '#9A9890',
  hairline: '#ECECEC',
  hairline2: '#F0EFE9',
  surface: '#F7F6F2',
  border: '#E4E2DA',
  accent: '#185FA5',
  danger: '#A32D2D',
  success: '#0F6E56',
  warnBg: '#FAEEDA',
  warnBorder: '#ECD9B0',
  warnText: '#633806',
  state: {
    TX: '#185FA5', NM: '#0F6E56', OK: '#BA7517', ND: '#993C1D',
    CO: '#534AB7', LA: '#993556', PA: '#0C447C', WY: '#3B6D11',
    WV: '#888780', NV: '#085041', CA: '#D85A30', MT: '#27500A',
  } as Record<string, string>,
};

// Stable fallback palette for any state not in the map above.
const palette = ['#185FA5', '#0F6E56', '#BA7517', '#534AB7', '#993556', '#993C1D', '#3B6D11', '#888780'];
export function stateColor(code: string, index = 0): string {
  return colors.state[code] ?? palette[index % palette.length];
}

export type AppColors = typeof colors;
