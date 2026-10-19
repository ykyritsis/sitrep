'use client';
import { NewsItem } from '@/types';
import { useFeed } from '@/lib/use-feed';

// Headline numbers for the hero. These read the same shared feeds as the panels below,
// so they add no extra requests.
export default function HeroStats() {
  const news = useFeed<NewsItem>('/api/news?category=all', 'items', 60000);
  const situations = useFeed<{severity:string}>('/api/situations', 'situations', 120000);
  const events = useFeed<{id:string}>('/api/events', 'events', 120000);
  const value = (feed: {updated: Date | null; error: boolean}, n: number) => feed.updated ? n.toLocaleString() : feed.error ? '—' : '…';
  const urgent = news.items.filter(i => i.severity === 'critical' || i.severity === 'high').length;
  const sources = new Set(news.items.map(i => i.source)).size;
  const escalating = situations.items.filter(s => s.severity === 'critical').length;
  const stats = [
    {label:'Stories tracked', value:value(news, news.items.length), note:value(news, sources) + ' sources'},
    {label:'High priority', value:value(news, urgent), note:'Critical or high severity'},
    {label:'Active situations', value:value(situations, situations.items.length), note:value(situations, escalating) + ' critical'},
    {label:'Mapped events', value:value(events, events.items.length), note:'On the globe'},
  ];
  return <dl className="hero-stats">
    {stats.map(s => <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd><dd className="hero-stat-note">{s.note}</dd></div>)}
  </dl>;
}
