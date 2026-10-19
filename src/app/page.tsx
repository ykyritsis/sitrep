'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Globe2, LayoutDashboard, Radio, TrendingUp, Maximize2, Minimize2, ArrowUpRight, Github, Layers, Quote, Orbit, ShieldCheck } from 'lucide-react';
import NewsFeed from '@/components/NewsFeed';
import DailyBrief from '@/components/DailyBrief';
import KpiRow from '@/components/KpiRow';
import { FlowPanel, LocationsPanel, EventMixPanel, HazardWatch, MarketPulse } from '@/components/Insights';
import AskFeed from '@/components/AskFeed';
import MarketOdds from '@/components/MarketOdds';
import CurrentSituations from '@/components/CurrentSituations';
import PopoutButton from '@/components/PopoutButton';

const Globe = dynamic(() => import('@/components/Globe'), {ssr:false,loading:() => <div className="empty-state">Loading globe…</div>});

const VIEWS = [
  {id:'overview',label:'Overview',Icon:LayoutDashboard},
  {id:'feed',label:'Feed',Icon:Radio},
  {id:'globe',label:'Globe',Icon:Globe2},
  {id:'markets',label:'Markets',Icon:TrendingUp},
] as const;
type View = typeof VIEWS[number]['id'];
const isView = (value:string): value is View => VIEWS.some(v => v.id === value);

const PAGE_COPY: Record<Exclude<View,'overview'>,{title:string;text:string}> = {
  feed: {title:'Feed', text:'Search, filter and translate the latest headlines.'},
  globe: {title:'Global view', text:'Drag to explore. Select a point for its source.'},
  markets: {title:'Markets', text:'What traders expect, by trading volume.'},
};

const BUILT = [
  {Icon:Layers, title:'One shared feed', text:'Every panel reads the same cached request.'},
  {Icon:Quote, title:'Cited AI', text:'Briefs and answers use only the headlines on screen, each linked.'},
  {Icon:Orbit, title:'Live 3D globe', text:'three.js events, with rings on critical ones.'},
  {Icon:ShieldCheck, title:'Guardrails', text:'Server-side key, caching and rate limits.'},
];
const STACK = ['Next.js 16','React 19','TypeScript','three.js','DeepSeek','Vercel'];

function BrandMark() {
  return <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
    <rect width="32" height="32" rx="9" fill="currentColor"/>
    <circle cx="16" cy="16" r="8.5" fill="none" stroke="#fff" strokeWidth="1.8" opacity=".95"/>
    <circle cx="16" cy="16" r="3.6" fill="none" stroke="#fff" strokeWidth="1.8" opacity=".6"/>
    <path d="M16 16 L22 10.4" stroke="#fff" strokeWidth="1.9" strokeLinecap="round"/>
  </svg>;
}

function GlobePanel({tall}:{tall?:boolean}) {
  return <section className={'panel globe-panel' + (tall ? ' is-tall' : '')} aria-label="Global event map">
    <header className="panel-header"><div><h2>Global view</h2><p>Reported events, approximate locations</p></div><PopoutButton panel="globe" className="icon-button"/></header>
    <div className="globe-stage"><Globe hotspots={[]}/></div>
  </section>;
}

export default function Home() {
  const [view,setView] = useState<View>('overview');
  const [fullscreen,setFullscreen] = useState(false);
  const [fullscreenError,setFullscreenError] = useState('');
  const [time,setTime] = useState('');
  const [date,setDate] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-GB',{timeZone:'UTC',hour:'2-digit',minute:'2-digit',hour12:false}));
      setDate(now.toLocaleDateString('en-GB',{timeZone:'UTC',weekday:'long',day:'numeric',month:'long'}));
    };
    const sync = () => setFullscreen(!!document.fullscreenElement);
    const fromHash = () => { const hash = window.location.hash.slice(1); setView(isView(hash) ? hash : 'overview'); };
    update(); fromHash();
    const timer = setInterval(update,1000);
    document.addEventListener('fullscreenchange',sync);
    window.addEventListener('hashchange',fromHash);
    return () => { clearInterval(timer); document.removeEventListener('fullscreenchange',sync); window.removeEventListener('hashchange',fromHash); };
  },[]);
  const go = (next:View) => {
    setView(next);
    history.replaceState(null,'',next === 'overview' ? window.location.pathname : '#' + next);
    window.scrollTo({top:0});
  };
  const toggleFullscreen = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); setFullscreenError(''); }
    catch { setFullscreenError('Fullscreen is unavailable in this browser.'); }
  };
  const tabs = (className:string) => <nav className={className} aria-label="Sections">
    {VIEWS.map(({id,label,Icon}) => <button key={id} aria-current={view === id ? 'page' : undefined} onClick={() => go(id)}><Icon size={18} aria-hidden="true"/><span>{label}</span></button>)}
  </nav>;

  return <div className="app">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="topbar">
      <div className="shell topbar-inner">
        <button className="brand" onClick={() => go('overview')} aria-label="SITREP overview"><BrandMark/><strong>SITREP</strong></button>
        {tabs('tabs')}
        <div className="topbar-meta">
          <span className="live-pill"><i aria-hidden="true"/>Live</span>
          <span className="utc-clock" aria-label="Coordinated universal time">{time || '--:--'}<small>UTC</small></span>
          <button className="icon-button fullscreen-button" aria-label={fullscreen ? 'Exit fullscreen':'Enter fullscreen'} onClick={toggleFullscreen}>{fullscreen ? <Minimize2 size={16}/>:<Maximize2 size={16}/>}</button>
        </div>
      </div>
    </header>
    {fullscreenError && <p className="shell feed-notice" role="status">{fullscreenError}</p>}

    <main id="main" className={'view-' + view}>
      {view === 'overview' ? <div className="shell page-body">
        <section className="intro">
          <div className="intro-copy">
            <p className="intro-date">{date}</p>
            <h1>The world,<br/>right now</h1>
          </div>
          <AskFeed/>
        </section>
        <KpiRow/>
        <div className="split split-globe">
          <GlobePanel/>
          <div className="panel situations-panel"><CurrentSituations/></div>
        </div>
        <div className="insights"><FlowPanel/><LocationsPanel/><EventMixPanel/></div>
        <div className="split split-watch"><HazardWatch/><MarketPulse/></div>
        <DailyBrief/>
        <div className="split split-feeds">
          <div className="panel"><NewsFeed limit={6} onMore={() => go('feed')}/></div>
          <div className="panel markets-list"><MarketOdds limit={4} onMore={() => go('markets')}/></div>
        </div>
        <section className="built" aria-labelledby="built-title">
          <div className="built-intro">
            <h2 id="built-title">How it&apos;s built</h2>
            <ul className="stack-list">{STACK.map(s => <li key={s}>{s}</li>)}</ul>
            <a className="button-link" href="https://github.com/ykyritsis/sitrep" target="_blank" rel="noopener noreferrer"><Github size={16}/>Source</a>
          </div>
          <div className="built-grid">{BUILT.map(({Icon,title,text}) => <article key={title}><Icon size={20} aria-hidden="true"/><h3>{title}</h3><p>{text}</p></article>)}</div>
        </section>
      </div> : <div className="shell page-body">
        <div className="page-head"><h1>{PAGE_COPY[view].title}</h1><p>{PAGE_COPY[view].text}</p></div>
        {view === 'feed' && <div className="with-aside">
          <div className="panel"><NewsFeed/></div>
          <aside className="aside-stack"><DailyBrief/><div className="panel"><CurrentSituations/></div></aside>
        </div>}
        {view === 'globe' && <GlobePanel tall/>}
        {view === 'markets' && <div className="panel markets-full"><MarketOdds/></div>}
      </div>}
    </main>

    <footer className="footer">
      <div className="shell footer-inner">
        <span><strong>SITREP</strong> · Headlines link to their original publishers.</span>
        <a href="https://ykcompany.com.au/sitrep-command-center/" target="_blank" rel="noopener noreferrer">A YK Co project <ArrowUpRight size={14}/></a>
      </div>
    </footer>
    {tabs('bottom-nav')}
  </div>;
}
