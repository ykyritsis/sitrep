'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

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
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="rounded-lg border border-slate-700/60 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Daily brief</h2>
        <button onClick={load} className="text-slate-400 hover:text-slate-200" aria-label="Refresh brief">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && <p className="text-sm text-slate-400">{error}</p>}

      {!error && loading && points.length === 0 && (
        <p className="text-sm text-slate-400">Generating brief…</p>
      )}

      <ul className="space-y-3">
        {points.map((p, i) => (
          <li key={i} className="text-sm text-slate-200">
            <span className="mr-2 text-xs uppercase tracking-wide text-slate-400">{p.theme}</span>
            <p>{p.text}</p>
            {p.sources.length > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                {p.sources.map((s, j) => (
                  <span key={j}>
                    {j > 0 && ' · '}
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 underline-offset-2 hover:underline">
                      {s.source}
                    </a>
                  </span>
                ))}
              </p>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[11px] text-slate-500">
        AI-generated summary of headlines above. Check the linked sources before relying on it.
        {generatedAt && ` Updated ${new Date(generatedAt).toLocaleTimeString()}.`}
      </p>
    </section>
  );
}
