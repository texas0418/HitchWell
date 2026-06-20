// Design tokens — derived from the agreed "money-forward" home direction.
// Neutral light theme, single blue accent, red for tax/alerts.

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
  warnBg: '#FAEEDA',
  warnBorder: '#ECD9B0',
  warnText: '#633806',
  state: {
    TX: '#185FA5',
    NM: '#0F6E56',
    OK: '#BA7517',
  } as Record<string, string>,
};

export type AppColors = typeof colors;
