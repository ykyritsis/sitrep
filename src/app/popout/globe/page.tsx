'use client';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const Globe = dynamic(() => import('@/components/Globe'),{ssr:false});
export default function Page() { return <div className="popout"><section className="panel globe-panel"><header className="panel-header"><div><h2>Global view</h2><p>SITREP / Command Center</p></div><Link href="/">Back to workspace</Link></header><div className="globe-stage"><Globe hotspots={[]}/></div></section></div>; }

