'use client';
import { useState } from 'react';
import { Search, ArrowUpRight, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { NewsItem } from '@/types';
import { useFeed } from '@/lib/use-feed';
import FeedHeader from './FeedHeader';

export default function NewsFeed({category = 'all'}: {category?: string}) {
  const {items, loading, error, updated, refresh} = useFeed<NewsItem>('/api/news?category=' + encodeURIComponent(category), 'items', 60000);
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const filtered = items.filter(item => (!priority || ['critical','high'].includes(item.severity || '')) &&
    (item.title + ' ' + item.source + ' ' + (item.country || '')).toLowerCase().includes(query.toLowerCase()));
  return <section className="feed">
    <FeedHeader title="Intelligence" subtitle={updated ? items.length + ' stories · Updated ' + updated.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : 'Global reporting, in one place'} loading={loading} refresh={refresh} panel="intel"/>
    <div className="feed-tools">
      <label className="search-field"><Search size={15}/><input aria-label="Search intelligence" placeholder="Search headlines, sources…" value={query} onChange={e => setQuery(e.target.value)}/></label>
      <div className="filter-row"><button aria-pressed={!priority} onClick={() => setPriority(false)}>All stories</button><button aria-pressed={priority} onClick={() => setPriority(true)}>High priority</button><span>{filtered.length}</span></div>
    </div>
    <div className="feed-scroll">
      {error && <p className="feed-notice" role="status">Unable to refresh. {updated ? 'Showing the last received stories.' : 'Try refreshing again.'}</p>}
      {loading && !updated && <div className="empty-state">Connecting to news sources…</div>}
      {!loading && !error && filtered.length === 0 && <div className="empty-state">No stories match this view.</div>}
      {filtered.map(item => {
        const date = new Date(item.pubDate);
        return <article className="story" key={item.id}>
          <div className="story-meta"><span>{item.source}</span><time dateTime={Number.isNaN(date.getTime()) ? undefined : date.toISOString()}>{Number.isNaN(date.getTime()) ? 'Time unavailable' : formatDistanceToNow(date, {addSuffix:true})}</time></div>
          <a className="story-title" href={item.link} target="_blank" rel="noopener noreferrer">{item.title}<ArrowUpRight size={13}/></a>
          <div className="story-tags">{item.country && <span>{item.country}</span>}{item.severity && ['critical','high'].includes(item.severity) && <span className={'severity ' + item.severity}>{item.severity}</span>}</div>
          {!!item.relatedArticles?.length && <><button className="related-toggle" aria-expanded={expanded === item.id} onClick={() => setExpanded(expanded === item.id ? null : item.id)}>{item.relatedArticles.length} more sources <ChevronDown size={12}/></button>
          {expanded === item.id && <div className="related-list">{item.relatedArticles.map((article,i) => <a key={article.link + i} href={article.link} target="_blank" rel="noopener noreferrer"><span>{article.source}</span>{article.title}</a>)}</div>}</>}
        </article>;
      })}
    </div>
    <div className="panel-footnote">Public sources · Refreshes every minute</div>
  </section>;
}

