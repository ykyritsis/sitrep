'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Globe2, LayoutDashboard, Radio, TrendingUp, Maximize2, Minimize2, ArrowUpRight, Github, Layers, Quote, Orbit, ShieldCheck } from 'lucide-react';
import NewsFeed from '@/components/NewsFeed';
import DailyBrief from '@/components/DailyBrief';
import HeroArt from '@/components/HeroArt';
import HeroStats from '@/components/HeroStats';
import AskFeed from '@/components/AskFeed';
import MarketOdds from '@/components/MarketOdds';
import CurrentSituations from '@/components/CurrentSituations';
import PopoutButton from '@/components/PopoutButton';

const Globe = dynamic(() => import('@/components/Globe'), {ssr:false,loading:() => <div className="empty-state">Preparing global view…</div>});

const VIEWS = [
  {id:'overview',label:'Overview',Icon:LayoutDashboard},
  {id:'feed',label:'Intelligence',Icon:Radio},
  {id:'globe',label:'Globe',Icon:Globe2},
  {id:'markets',label:'Markets',Icon:TrendingUp},
] as const;
type View = typeof VIEWS[number]['id'];
const isView = (value:string): value is View => VIEWS.some(v => v.id === value);

const PAGE_COPY: Record<Exclude<View,'overview'>,{eyebrow:string;title:string;text:string}> = {
  feed: {eyebrow:'Intelligence', title:'Every headline, one feed', text:'Stories from public outlets, grouped when several report the same event. Search, filter by priority or read the first ten in Greek.'},
  globe: {eyebrow:'Global view', title:'Where it is happening', text:'Reported events placed on a 3D globe. Drag to explore, scroll or pinch to zoom, and select a point for its source.'},
  markets: {eyebrow:'Markets', title:'What traders expect', text:'Prediction-market odds on geopolitical questions, sorted by trading volume. Prices reflect sentiment, not certainty.'},
};

const BUILT = [
  {Icon:Layers, title:'One shared feed', text:'Server routes aggregate RSS feeds and Polymarket. In the browser every panel shares one request per feed, and polling pauses while the tab is hidden.'},
  {Icon:Quote, title:'AI that cites its sources', text:'DeepSeek writes the brief and answers questions using only the headlines on screen. Every point links back to the articles behind it.'},
  {Icon:Orbit, title:'Interactive 3D globe', text:'three.js through react-globe.gl plots geolocated events, with pulsing rings for critical ones and a detail card for each point.'},
  {Icon:ShieldCheck, title:'Cost and abuse controls', text:'AI results are cached on the server, each visitor has a rate limit, and the API key never reaches the browser.'},
];
const STACK = ['Next.js 16','React 19','TypeScript','three.js','DeepSeek API','Vercel'];

function BrandMark() {
  return <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
    <path d="M1 9V1h8M23 1h8v8M31 23v8h-8M9 31H1v-8" fill="none" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="16" cy="16" r="9" fill="none" stroke="currentColor" strokeWidth="1.4" opacity=".9"/>
    <circle cx="16" cy="16" r="4" fill="none" stroke="currentColor" strokeWidth="1.4" opacity=".5"/>
    <path d="M16 16 L22.4 10.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="20.5" cy="19.5" r="1.8" fill="#ff4d5e"/>
  </svg>;
}

function GlobePanel({tall}:{tall?:boolean}) {
  return <section className={'panel globe-panel' + (tall ? ' is-tall' : '')} aria-label="Global event map">
    <header className="panel-header"><div><h2>Global view</h2><p>Reported events, mapped geographically</p></div><PopoutButton panel="globe" className="icon-button"/></header>
    <div className="globe-stage"><Globe hotspots={[]}/></div>
    <div className="globe-caption"><span>Drag to explore · Scroll or pinch to zoom</span><span>Locations are approximate</span></div>
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
      <div className="classification"><div className="shell"><span>Open source // Unclassified</span><span>Feeds nominal · Auto-refresh on</span></div></div>
      <div className="shell topbar-inner">
        <button className="brand" onClick={() => go('overview')} aria-label="SITREP overview"><BrandMark/><span><strong>SITREP</strong><small>Global situation report</small></span></button>
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
      {view === 'overview' ? <>
        <section className="hero">
          <div className="shell hero-inner">
            <div className="hero-copy">
              <span className="eyebrow">Situation report{date && ' · ' + date}{time && ' · ' + time + 'Z'}</span>
              <h1>The world, <em>in focus</em><span className="cursor" aria-hidden="true">_</span></h1>
              <p className="lede">Live reporting from public outlets, mapped on a 3D globe, summarised by AI with citations and weighed against prediction markets.</p>
              <AskFeed/>
            </div>
            <div className="hero-visual" aria-hidden="true"><HeroArt/></div>
            <HeroStats/>
          </div>
        </section>
        <div className="shell page-body">
          <DailyBrief/>
          <div className="split split-globe">
            <GlobePanel/>
            <div className="panel situations-panel"><CurrentSituations/></div>
          </div>
          <div className="split split-feeds">
            <div className="panel"><NewsFeed limit={6} onMore={() => go('feed')}/></div>
            <div className="panel markets-list"><MarketOdds limit={4} onMore={() => go('markets')}/></div>
          </div>
          <section className="built" aria-labelledby="built-title">
            <div className="built-intro">
              <span className="eyebrow">Under the hood</span>
              <h2 id="built-title">How it&apos;s built</h2>
              <p>A Next.js app that turns public feeds into a live, sourced picture of the world, with AI kept on a short leash.</p>
              <ul className="stack-list">{STACK.map(s => <li key={s}>{s}</li>)}</ul>
              <a className="button-link" href="https://github.com/ykyritsis/sitrep" target="_blank" rel="noopener noreferrer"><Github size={16}/>View the source</a>
            </div>
            <div className="built-grid">{BUILT.map(({Icon,title,text}) => <article key={title}><Icon size={20} aria-hidden="true"/><h3>{title}</h3><p>{text}</p></article>)}</div>
          </section>
        </div>
      </> : <>
        <section className="subhero"><div className="shell"><span className="eyebrow">{PAGE_COPY[view].eyebrow}</span><h1>{PAGE_COPY[view].title}</h1><p>{PAGE_COPY[view].text}</p></div></section>
        <div className="shell page-body">
          {view === 'feed' && <div className="with-aside">
            <div className="panel"><NewsFeed/></div>
            <aside className="aside-stack"><DailyBrief/><div className="panel"><CurrentSituations/></div></aside>
          </div>}
          {view === 'globe' && <GlobePanel tall/>}
          {view === 'markets' && <div className="panel markets-full"><MarketOdds/></div>}
        </div>
      </>}
    </main>

    <footer className="footer">
      <div className="shell footer-inner">
        <span><strong>SITREP</strong> · Headlines belong to their publishers and link to the original articles.</span>
        <a href="https://ykcompany.com.au/sitrep-command-center/" target="_blank" rel="noopener noreferrer">A YK Co project <ArrowUpRight size={14}/></a>
      </div>
    </footer>
    {tabs('bottom-nav')}
  </div>;
}
