// All US states + DC for state pickers. Oilfield-heavy states first so the
// common picks sit at the top of the list, then the rest alphabetically.

export const OILFIELD_STATES = ['TX', 'NM', 'OK', 'ND', 'LA', 'CO', 'WY', 'PA', 'WV', 'CA', 'AK', 'MT'];

export const ALL_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL',
  'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
  'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
  'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
  'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

// Ordered list for pickers: oilfield states first, remainder alphabetical.
export const PICKER_STATES = [
  ...OILFIELD_STATES,
  ...ALL_STATES.filter((s) => !OILFIELD_STATES.includes(s)),
];
