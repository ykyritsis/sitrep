'use client';
import { useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { useFeed } from '@/lib/use-feed';
import FeedHeader from './FeedHeader';
interface MarketData {
  id:string; question:string; probability:number; volume:number; category:string; url?:string;
  answers?:{id:string;text:string;probability:number}[];
}
const percent = (value:number) => Math.round(Math.min(1,Math.max(0,Number.isFinite(value) ? value : 0))*100);
const dollars = new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',notation:'compact',maximumFractionDigits:1});
export default function MarketOdds() {
  const {items,loading,error,refresh} = useFeed<MarketData>('/api/markets','markets',300000);
  const [expanded,setExpanded] = useState<string|null>(null);
  return <section className="feed">
    <FeedHeader title="Prediction markets" subtitle="Polymarket · Market-implied probabilities" loading={loading} refresh={refresh} panel="markets"/>
    <div className="feed-scroll">
      {error && <p className="feed-notice" role="status">Market updates are unavailable. Try refreshing.</p>}
      {loading && !items.length && <div className="empty-state">Loading market activity…</div>}
      {!loading && !error && !items.length && <div className="empty-state">No markets available.</div>}
      {[...items].sort((a,b) => b.volume-a.volume).map(m => <article key={m.id} className="market">
        <div className="market-main"><div><span className="eyebrow">{m.category}</span><h3>{m.question}</h3></div>{!m.answers?.length && <div className="market-probability">{percent(m.probability)}<span>%</span><small>Yes</small></div>}</div>
        {!m.answers?.length && <div className="probability-track"><span style={{width:percent(m.probability)+'%'}}/></div>}
        <div className="market-meta"><span>{dollars.format(m.volume)} volume</span>{!!m.answers?.length && <button aria-expanded={expanded === m.id} onClick={() => setExpanded(expanded === m.id ? null : m.id)}>{m.answers.length} outcomes <ChevronDown size={12}/></button>}{m.url && <a aria-label={'View market: '+m.question} href={m.url} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={14}/></a>}</div>
        {expanded === m.id && <div className="market-answers">{m.answers?.map(a => <div key={a.id}><span>{a.text}</span><strong>{percent(a.probability)}%</strong></div>)}</div>}
      </article>)}
    </div>
    <div className="panel-footnote">Market prices reflect trading sentiment.</div>
  </section>;
}

