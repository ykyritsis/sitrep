import type { NewsItem } from '@/types';

export interface FlowBucket { normal: number; high: number; critical: number; total: number }
export interface Flow { buckets: FlowBucket[]; hours: number }

// Splits the loaded stories into equal time slices between the oldest story and the last refresh.
// Using the refresh time (not "now") keeps this a pure function of the data.
export function flowBuckets(items: NewsItem[], end: Date | null, slices: number): Flow {
  const buckets: FlowBucket[] = Array.from({ length: slices }, () => ({ normal: 0, high: 0, critical: 0, total: 0 }));
  const all = items.map(i => ({ t: new Date(i.pubDate).getTime(), severity: i.severity })).filter(i => Number.isFinite(i.t));
  if (!all.length || !end) return { buckets, hours: 0 };
  const stop = Math.max(end.getTime(), ...all.map(i => i.t));
  // One stale story shouldn't stretch the chart, so the window is capped at 24 hours.
  const times = all.filter(i => i.t >= stop - 24 * 3600e3);
  const start = Math.min(...times.map(i => i.t));
  const span = Math.max(stop - start, 3600e3);
  for (const { t, severity } of times) {
    const slot = Math.min(slices - 1, Math.floor(((t - (stop - span)) / span) * slices));
    const b = buckets[Math.max(0, slot)];
    b.total++;
    if (severity === 'critical') b.critical++;
    else if (severity === 'high') b.high++;
    else b.normal++;
  }
  return { buckets, hours: Math.max(1, Math.round(span / 3600e3)) };
}
