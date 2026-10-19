'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Globe2, LayoutDashboard, Radio, TrendingUp, Maximize2, Minimize2, ArrowUpRight } from 'lucide-react';
import NewsFeed from '@/components/NewsFeed';
import DailyBrief from '@/components/DailyBrief';
import MarketOdds from '@/components/MarketOdds';
import CurrentSituations from '@/components/CurrentSituations';
import PopoutButton from '@/components/PopoutButton';

const Globe = dynamic(() => import('@/components/Globe'), {ssr:false,loading:() => <div className="empty-state">Preparing global view…</div>});
export default function Home() {
  const [view,setView] = useState('overview');
  const [fullscreen,setFullscreen] = useState(false);
  const [fullscreenError,setFullscreenError] = useState('');
  const [time,setTime] = useState('');
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleString('en-GB',{timeZone:'UTC',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}));
    const sync = () => setFullscreen(!!document.fullscreenElement);
    update(); const timer = setInterval(update,1000);
    document.addEventListener('fullscreenchange',sync);
    return () => { clearInterval(timer); document.removeEventListener('fullscreenchange',sync); };
  },[]);
  const toggleFullscreen = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); setFullscreenError(''); }
    catch { setFullscreenError('Fullscreen is unavailable in this browser.'); }
  };
  const views = [{id:'overview',label:'Overview',Icon:LayoutDashboard},{id:'globe',label:'Global view',Icon:Globe2},{id:'feed',label:'Intelligence',Icon:Radio},{id:'markets',label:'Markets',Icon:TrendingUp}];
  return <div className="command-app">
    <header className="app-header">
      <Link className="brand-lockup" href="/"><span className="brand-symbol"><Globe2 size={23}/></span><span><strong>SITREP<span className="brand-divider">/</span><span className="brand-descriptor">Command Center</span></strong><small>A clearer view of a complex world.</small></span></Link>
      <div className="header-right"><span className="utc-clock">{time || 'Synchronizing'}<small>UTC</small></span><button className="icon-button fullscreen-button" aria-label={fullscreen ? 'Exit fullscreen':'Enter fullscreen'} onClick={toggleFullscreen}>{fullscreen ? <Minimize2 size={17}/>:<Maximize2 size={17}/>}</button></div>
    </header>
    <div className="workspace-heading"><div><span className="eyebrow">GLOBAL INTELLIGENCE</span><h1>The world, in focus.</h1></div><p>Reporting. Regional signals. Market sentiment.<br/>One connected workspace.</p></div>
    <nav className="workspace-nav" aria-label="Workspace view"><div className="view-switcher">{views.map(({id,label,Icon}) => <button key={id} aria-pressed={view===id} onClick={() => setView(id)}><Icon size={14}/><span>{label}</span></button>)}</div><span className="auto-refresh"><span/>Automatic updates</span></nav>
    {fullscreenError && <p className="feed-notice" role="status">{fullscreenError}</p>}
    <main className={'workspace view-'+view}>
      <div className="panel intelligence-panel"><DailyBrief/><NewsFeed/></div>
      <section className="panel globe-panel" aria-label="Global event map"><header className="panel-header"><div><h2>Global view</h2><p>Reported events, mapped geographically</p></div><PopoutButton panel="globe" className="icon-button"/></header><div className="globe-stage"><Globe hotspots={[]}/></div><div className="globe-caption"><span>Drag to explore · Scroll to zoom</span><span>Locations are approximate</span></div></section>
      <aside className="signals-column"><div className="panel situations-panel"><CurrentSituations/></div><div className="panel markets-panel"><MarketOdds/></div></aside>
    </main>
    <footer className="app-footer"><span>SITREP <span className="footer-divider">/</span> Open-source intelligence</span><a href="https://ykcompany.com.au/sitrep-command-center/" target="_blank" rel="noopener noreferrer">A YK Co project <ArrowUpRight size={12}/></a></footer>
  </div>;
}

