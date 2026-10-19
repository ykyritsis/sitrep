// Event categories shared by the globe and the charts, so colours match everywhere.
// Colours are chosen to read on a light map: conflict types sit in reds, pinks and a few cool accents,
// natural hazards in oranges, indigo and teal.
export type EventCategory = 'conflict' | 'hazard';

export const eventTypeConfig: Record<string, { label: string; color: string; category: EventCategory }> = {
  missile: { label: 'MISSILE', color: '#dc2626', category: 'conflict' },
  airstrike: { label: 'AIRSTRIKE', color: '#e11d48', category: 'conflict' },
  drone: { label: 'DRONE', color: '#be185d', category: 'conflict' },
  naval: { label: 'NAVAL', color: '#0369a1', category: 'conflict' },
  military: { label: 'MILITARY', color: '#9a3412', category: 'conflict' },
  protest: { label: 'PROTEST', color: '#7c3aed', category: 'conflict' },
  cyber: { label: 'CYBER', color: '#0e7490', category: 'conflict' },
  terror: { label: 'TERROR', color: '#7f1d1d', category: 'conflict' },
  raid: { label: 'RAID', color: '#c026d3', category: 'conflict' },
  explosion: { label: 'EXPLOSION', color: '#b91c1c', category: 'conflict' },
  shooting: { label: 'SHOOTING', color: '#be123c', category: 'conflict' },
  conflict: { label: 'CONFLICT', color: '#c2410c', category: 'conflict' },
  breaking: { label: 'BREAKING', color: '#a16207', category: 'conflict' },
  quake: { label: 'EARTHQUAKE', color: '#4f46e5', category: 'hazard' },
  wildfire: { label: 'WILDFIRE', color: '#f97316', category: 'hazard' },
  storm: { label: 'STORM', color: '#0ea5e9', category: 'hazard' },
  flood: { label: 'FLOOD', color: '#2563eb', category: 'hazard' },
  volcano: { label: 'VOLCANO', color: '#78350f', category: 'hazard' },
  drought: { label: 'DROUGHT', color: '#ca8a04', category: 'hazard' },
};

export const categoryOf = (type: string): EventCategory => eventTypeConfig[type]?.category ?? 'conflict';
