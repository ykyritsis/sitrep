'use client';
import { useState } from 'react';
import { ChevronDown, ArrowUpRight } from 'lucide-react';
import { useFeed } from '@/lib/use-feed';
import FeedHeader from './FeedHeader';
interface Situation {
  id:string; name:string; region:string; status:string; severity:string; parties:string[];
  articleCount:number; latestArticles:{title:string;link:string}[];
}
export default function CurrentSituations() {
  const {items,loading,error,refresh} = useFeed<Situation>('/api/situations','situations',120000);
  const [expanded,setExpanded] = useState<string|null>(null);
  const most = Math.max(1,...items.map(s => s.articleCount));
  return <section className="feed">
    <FeedHeader title="Situations" subtitle="Ranked by mentions" loading={loading} refresh={refresh}/>
    <div className="feed-scroll">
      {error && <p className="feed-notice" role="status">Situation updates are unavailable.</p>}
      {loading && !items.length && <div className="empty-state">Reading regional signals…</div>}
      {!loading && !error && !items.length && <div className="empty-state">No situations detected in current reporting.</div>}
      {items.map(s => <article className="situation" key={s.id}>
        <button className="situation-toggle" onClick={() => setExpanded(expanded === s.id ? null : s.id)} aria-expanded={expanded === s.id}>
          <span className={'signal-dot ' + s.severity}/><span className="situation-label"><strong>{s.name}</strong><small>{s.region} · {s.articleCount} mentions</small><span className={'mention-bar ' + s.severity}><i style={{width:(s.articleCount/most*100)+'%'}}/></span></span><span className={'severity ' + s.severity}>{s.status}</span><ChevronDown size={13}/>
        </button>
        {expanded === s.id && <div className="situation-detail"><p>{s.parties.join(' · ')}</p>{s.latestArticles.map((a,i) => <a key={a.link + i} href={a.link} target="_blank" rel="noopener noreferrer">{a.title}<ArrowUpRight size={13}/></a>)}</div>}
      </article>)}
    </div>
  </section>;
}

