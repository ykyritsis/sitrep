'use client';

import { useState, useEffect } from 'react';
import { Globe2, RefreshCw, ExternalLink } from 'lucide-react';

interface GDELTEvent {
  id: string;
  title: string;
  url: string;
  source: string;
  timestamp: string;
  category: string;
  tone: number;
}

export default function GDELTFeed() {
  const [events, setEvents] = useState<GDELTEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gdelt');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setEvents(data.events || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch GDELT data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 180000); // 3 min refresh
    return () => clearInterval(interval);
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'military': return 'text-red-400 bg-red-500/15';
      case 'attack': return 'text-orange-400 bg-orange-500/15';
      case 'unrest': return 'text-amber-400 bg-amber-500/15';
      case 'political': return 'text-blue-400 bg-blue-500/15';
      case 'economic': return 'text-emerald-400 bg-emerald-500/15';
      default: return 'text-slate-400 bg-slate-500/15';
    }
  };

  const getToneIndicator = (tone: number) => {
    if (tone < -5) return { color: 'text-red-400', label: 'Negative' };
    if (tone > 5) return { color: 'text-emerald-400', label: 'Positive' };
    return { color: 'text-slate-400', label: 'Neutral' };
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="card-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-blue-400" />
          <span className="text-slate-200 text-xs font-bold tracking-wide">GDELT</span>
        </div>
        <button 
          onClick={fetchEvents} 
          className="text-slate-500 hover:text-slate-300 transition-colors p-1 hover:bg-slate-700 rounded"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {error && <div className="p-4 text-red-400 text-sm bg-red-500/10">{error}</div>}
        
        {loading && events.length === 0 ? (
          <div className="p-4 text-slate-400 text-sm">Loading global events...</div>
        ) : events.length === 0 ? (
          <div className="p-4 text-slate-400 text-sm">No events available</div>
        ) : (
          <div>
            {events.map((event) => (
              <a 
                key={event.id} 
                href={event.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="feed-item block hover:bg-slate-700/50 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-300 leading-snug line-clamp-2">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded ${getCategoryColor(event.category)}`}>
                        {event.category}
                      </span>
                      <span className="text-[9px] text-slate-500">{event.source}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-slate-600" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
