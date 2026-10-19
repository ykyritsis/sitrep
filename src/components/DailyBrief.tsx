'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { isTabHidden } from '@/lib/shared-fetch';

interface BriefSource {
  title: string;
  source: string;
  link: string;
}

interface BriefPoint {
  theme: string;
  text: string;
  sources: BriefSource[];
}

const REFRESH_MS = 30 * 60 * 1000;

export default function DailyBrief() {
  const [points, setPoints] = useState<BriefPoint[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/brief');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Brief unavailable');
        setPoints([]);
      } else {
        setPoints(data.points || []);
        setGeneratedAt(data.generatedAt || null);
        setError(null);
      }
    } catch {
      setError('Brief unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // The brief changes at most every 30 minutes on the server, so only poll while the tab is visible.
    const id = setInterval(() => { if (!isTabHidden()) load(); }, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="brief-card" aria-labelledby="daily-brief-title">
      <div className="brief-header">
        <h2 id="daily-brief-title" className="brief-title">
          <Sparkles size={14} aria-hidden="true" /> Daily brief
        </h2>
        <button onClick={load} className="icon-button brief-refresh" aria-label="Refresh brief">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && <p className="brief-muted">{error}</p>}

      {!error && loading && points.length === 0 && <p className="brief-muted">Generating brief…</p>}

      <ul className="brief-list">
        {points.map((p, i) => (
          <li key={i} className="brief-item">
            <span className="brief-theme">{p.theme}</span>
            <p className="brief-text">{p.text}</p>
            {p.sources.length > 0 && (
              <p className="brief-sources">
                {p.sources.map((s, j) => (
                  <span key={j}>
                    {j > 0 && ' · '}
                    <a href={s.link} target="_blank" rel="noopener noreferrer">{s.source}</a>
                  </span>
                ))}
              </p>
            )}
          </li>
        ))}
      </ul>

      <p className="brief-note">
        AI-generated summary of headlines above. Check the linked sources before relying on it.
        {generatedAt && ` Updated ${new Date(generatedAt).toLocaleTimeString()}.`}
      </p>
    </section>
  );
}
