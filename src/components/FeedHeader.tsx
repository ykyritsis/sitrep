'use client';
import { RefreshCw } from 'lucide-react';
import PopoutButton from './PopoutButton';
export default function FeedHeader({title, subtitle, loading, refresh, panel}: {
  title: string; subtitle: string; loading: boolean; refresh: () => void; panel?: 'intel' | 'markets';
}) {
  return <header className="panel-header"><div><h2>{title}</h2><p>{subtitle}</p></div>
    <div className="header-actions">
      <button className="icon-button" aria-label={'Refresh ' + title.toLowerCase()} onClick={refresh} disabled={loading}>
        <RefreshCw size={14} className={loading ? 'animate-spin' : ''}/>
      </button>
      {panel && <PopoutButton panel={panel} className="icon-button"/>}
    </div>
  </header>;
}

