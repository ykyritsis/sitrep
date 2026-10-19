'use client';
import { useMemo } from 'react';
import { NewsItem } from '@/types';
import { useFeed } from '@/lib/use-feed';
import { useEvents } from '@/lib/use-events';
import { flowBuckets } from '@/lib/flow';
import { eventTypeConfig } from '@/lib/event-types';
import { CountUp, Ring, SegBar, Spark } from './charts';

// Headline numbers. They read the same shared feeds as the panels below, so they add no requests.
export default function KpiRow() {
  const news = useFeed<NewsItem>('/api/news?category=all', 'items', 60000);
  const situations = useFeed<{ severity: string }>('/api/situations', 'situations', 120000);
  const events = useEvents();
  const flow = useMemo(() => flowBuckets(news.items, news.updated, 18), [news.items, news.updated]);

  const critical = news.items.filter(i => i.severity === 'critical').length;
  const high = news.items.filter(i => i.severity === 'high').length;
  const sources = new Set(news.items.map(i => i.source)).size;
  const sev = (s: string) => situations.items.filter(x => x.severity === s).length;
  const types = Object.entries(events.items.reduce<Record<string, number>>((acc, e) => ({ ...acc, [e.type]: (acc[e.type] || 0) + 1 }), {}))
    .sort((a, b) => b[1] - a[1]);

  const num = (feed: { updated: Date | null; error: boolean }, n: number) =>
    feed.updated ? <CountUp value={n} /> : feed.error ? '–' : <span className="kpi-wait">··</span>;

  return <div className="kpis">
    <article className="kpi">
      <div className="kpi-top"><span>Stories</span><Spark values={flow.buckets.map(b => b.total)} /></div>
      <strong>{num(news, news.items.length)}</strong>
      <small>{news.updated ? `from ${sources} sources` : 'Loading'}</small>
    </article>
    <article className="kpi">
      <div className="kpi-top"><span>High priority</span>
        <Ring size={52} stroke={7} total={Math.max(news.items.length, 1)} parts={[{ value: critical, color: 'var(--critical)' }, { value: high, color: 'var(--high)' }]} />
      </div>
      <strong>{num(news, critical + high)}</strong>
      <small>{news.updated ? `${critical} critical · ${high} high` : 'Loading'}</small>
    </article>
    <article className="kpi">
      <div className="kpi-top"><span>Situations</span></div>
      <strong>{num(situations, situations.items.length)}</strong>
      <SegBar parts={[
        { label: 'critical', value: sev('critical'), color: 'var(--critical)' },
        { label: 'high', value: sev('high'), color: 'var(--high)' },
        { label: 'other', value: situations.items.length - sev('critical') - sev('high'), color: 'var(--accent)' },
      ]} />
      <small>{situations.updated ? `${sev('critical')} critical` : 'Loading'}</small>
    </article>
    <article className="kpi">
      <div className="kpi-top"><span>Mapped events</span></div>
      <strong>{num(events, events.items.length)}</strong>
      <SegBar parts={types.map(([t, n]) => ({ label: t, value: n, color: eventTypeConfig[t]?.color || '#94a3b8' }))} />
      <small>{events.updated ? `${events.counts.hazard} hazards · ${events.counts.conflict} conflict` : 'Loading'}</small>
    </article>
  </div>;
}
