'use client';
import { useMemo } from 'react';
import { NewsItem } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpRight } from 'lucide-react';
import { useFeed } from '@/lib/use-feed';
import { useEvents, type MapEvent } from '@/lib/use-events';
import { flowBuckets } from '@/lib/flow';
import { eventTypeConfig } from '@/lib/event-types';
import { BarList, Spark } from './charts';

function Card({ title, note, className = '', children }: { title: string; note?: string; className?: string; children: React.ReactNode }) {
  return <section className={'panel insight ' + className}>
    <header className="panel-header"><div><h2>{title}</h2>{note && <p>{note}</p>}</div></header>
    <div className="insight-body">{children}</div>
  </section>;
}

export function FlowPanel() {
  const news = useFeed<NewsItem>('/api/news?category=all', 'items', 60000);
  const flow = useMemo(() => flowBuckets(news.items, news.updated, 24), [news.items, news.updated]);
  const max = Math.max(...flow.buckets.map(b => b.total), 1);
  return <Card title="Story flow" note={flow.hours ? `Last ${flow.hours}h` : undefined} className="flow-card">
    {!news.updated ? <div className="empty-state">{news.error ? 'Unavailable.' : 'Loading…'}</div> : <>
      <div className="flow" role="img" aria-label={`Stories over the last ${flow.hours} hours, ${max} at the busiest`}>
        {flow.buckets.map((b, i) => <div className="flow-col" key={i} style={{ '--i': i } as React.CSSProperties} title={`${b.total} stories`}>
          <div className={'flow-bar' + (b.total ? '' : ' is-empty')} style={{ height: b.total ? `${(b.total / max) * 100}%` : undefined }}>
            {b.critical > 0 && <i className="flow-critical" style={{ flex: b.critical }} />}
            {b.high > 0 && <i className="flow-high" style={{ flex: b.high }} />}
            {b.normal > 0 && <i className="flow-normal" style={{ flex: b.normal }} />}
          </div>
        </div>)}
      </div>
      <div className="flow-axis"><span>{flow.hours}h ago</span><span>Now</span></div>
      <ul className="legend"><li><i className="flow-critical" />Critical</li><li><i className="flow-high" />High</li><li><i className="flow-normal" />Other</li></ul>
    </>}
  </Card>;
}

export function LocationsPanel() {
  const news = useFeed<NewsItem>('/api/news?category=all', 'items', 60000);
  const rows = useMemo(() => Object.entries(news.items.reduce<Record<string, number>>((acc, i) => i.country ? { ...acc, [i.country]: (acc[i.country] || 0) + 1 } : acc, {}))
    .sort((a, b) => b[1] - a[1]).slice(0, 7).map(([label, value]) => ({ label, value, color: 'var(--accent)' })), [news.items]);
  return <Card title="Top locations" note="Stories by country">
    {rows.length ? <BarList rows={rows} /> : <div className="empty-state">{news.updated ? 'No locations yet.' : news.error ? 'Unavailable.' : 'Loading…'}</div>}
  </Card>;
}

export function EventMixPanel() {
  const events = useEvents();
  const rows = useMemo(() => Object.entries(events.items.reduce<Record<string, number>>((acc, e) => ({ ...acc, [e.type]: (acc[e.type] || 0) + 1 }), {}))
    .sort((a, b) => b[1] - a[1]).slice(0, 8).map(([type, value]) => {
      const label = eventTypeConfig[type]?.label.toLowerCase() || type;
      return { label: label[0].toUpperCase() + label.slice(1), value, color: eventTypeConfig[type]?.color };
    }), [events.items]);
  return <Card title="Event types" note="Conflict and natural hazards">
    {rows.length ? <BarList rows={rows} /> : <div className="empty-state">{events.updated ? 'No events yet.' : events.error ? 'Unavailable.' : 'Loading…'}</div>}
  </Card>;
}

export function HazardWatch() {
  const hazards = useFeed<MapEvent>('/api/hazards', 'events', 600000);
  // Most severe first; the feed is already sorted that way, so the top of the list is the most significant.
  const rows = hazards.items.slice(0, 6);
  return <Card title="Hazard watch" note="Earthquakes, storms, floods and fires" className="hazard-card">
    {rows.length ? <ul className="hazard-list">
      {rows.map(h => <li key={h.id}>
        <i style={{ background: eventTypeConfig[h.type]?.color }} aria-hidden="true" />
        <div>
          <a href={h.sourceUrl} target="_blank" rel="noopener noreferrer">{h.title}<ArrowUpRight size={13} /></a>
          <small>{h.source} · {formatDistanceToNow(new Date(h.timestamp), { addSuffix: true })}</small>
        </div>
        {h.magnitude && <span className={'severity ' + h.severity}>{h.magnitude}</span>}
      </li>)}
    </ul> : <div className="empty-state">{hazards.updated ? 'No hazards reported.' : hazards.error ? 'Unavailable.' : 'Loading…'}</div>}
  </Card>;
}

interface PulseTile { id: string; label: string; value: number; change: number; period: string; series: number[]; unit: string; decimals: number }

export function MarketPulse() {
  const pulse = useFeed<PulseTile>('/api/pulse', 'tiles', 900000);
  return <Card title="Market pulse" note="Currencies and crypto" className="pulse-card">
    {pulse.items.length ? <div className="pulse-grid">
      {pulse.items.map(t => <article key={t.id} className="pulse-tile">
        <span className="pulse-label">{t.label}</span>
        <strong>{t.unit}{t.value.toLocaleString(undefined, { minimumFractionDigits: t.decimals, maximumFractionDigits: t.decimals })}</strong>
        <span className={'pulse-change ' + (t.change >= 0 ? 'up' : 'down')}>{t.change >= 0 ? '▲' : '▼'} {Math.abs(t.change).toFixed(2)}% <small>{t.period}</small></span>
        <Spark values={t.series} color={t.change >= 0 ? 'var(--live)' : 'var(--critical)'} />
      </article>)}
    </div> : <div className="empty-state">{pulse.updated ? 'No data.' : pulse.error ? 'Unavailable.' : 'Loading…'}</div>}
  </Card>;
}
