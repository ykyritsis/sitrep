'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

interface ArticleRef {
  title: string;
  link: string;
}

interface Situation {
  id: string;
  name: string;
  region: string;
  status: 'active' | 'escalating' | 'monitoring';
  severity: 'critical' | 'high' | 'medium' | 'low';
  parties: string[];
  articleCount: number;
  latestArticles: ArticleRef[];
  lastUpdate: string;
}

export default function CurrentSituations() {
  const [situations, setSituations] = useState<Situation[]>([]);
  const [selectedSituation, setSelectedSituation] = useState<Situation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSituations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/situations');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSituations(data.situations || []);
      setError(null);
    } catch (err) {
      setError('Failed to detect situations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSituations();
    const interval = setInterval(fetchSituations, 120000); // Refresh every 2 min
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'escalating': return 'text-red-400 bg-red-500/15';
      case 'active': return 'text-orange-400 bg-orange-500/15';
      case 'de-escalating': return 'text-emerald-400 bg-emerald-500/15';
      case 'monitoring': return 'text-blue-400 bg-blue-500/15';
      default: return 'text-slate-400 bg-slate-500/15';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-amber-500';
      case 'low': return 'border-l-emerald-500';
      default: return 'border-l-slate-500';
    }
  };

  const getSeverityDot = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* Header - Compact Pentagon Style */}
      <div className="px-3 py-2 border-b border-slate-700/50 bg-gradient-to-r from-slate-900 via-slate-800/50 to-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 neon-red" />
            <span className="text-red-400 text-[10px] font-bold tracking-[0.12em]">ACTIVE SITUATIONS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-emerald-400 font-mono">{situations.filter(s => s.status === 'active' || s.status === 'escalating').length} LIVE</span>
            <button 
              onClick={fetchSituations} 
              className="text-slate-500 hover:text-red-400 transition-all p-1 hover:bg-red-500/10 rounded"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Situations List */}
      <div className="flex-1 overflow-y-auto">
        {error && <div className="p-3 text-red-400 text-xs bg-red-500/10">{error}</div>}
        
        {loading && situations.length === 0 && (
          <div className="p-4 text-slate-400 text-sm">Analyzing news feeds...</div>
        )}
        
        {!loading && situations.length === 0 && (
          <div className="p-4 text-slate-400 text-sm">No active situations detected</div>
        )}
        
        {situations.map((situation) => (
          <div
            key={situation.id}
            onClick={() => setSelectedSituation(selectedSituation?.id === situation.id ? null : situation)}
            className={`border-l-2 ${getSeverityColor(situation.severity)} cursor-pointer transition-all hover:bg-slate-800/50 ${selectedSituation?.id === situation.id ? 'bg-slate-800' : ''}`}
          >
            <div className="px-2 py-1.5">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-1 h-1 rounded-full flex-shrink-0 ${getSeverityDot(situation.severity)} ${situation.status === 'active' || situation.status === 'escalating' ? 'animate-pulse' : ''}`} />
                  <span className="text-[9px] text-slate-200 font-medium truncate">{situation.name}</span>
                </div>
                <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-medium flex-shrink-0 ${getStatusColor(situation.status)}`}>
                  {situation.status}
                </span>
              </div>
              
              {/* Expanded Details */}
              {selectedSituation?.id === situation.id && (
                <div className="mt-2 ml-4 space-y-2">
                  {/* Latest Articles with Links */}
                  {situation.latestArticles && situation.latestArticles.length > 0 && (
                    <div className="space-y-1">
                      {situation.latestArticles.map((article: ArticleRef, i: number) => (
                        <a 
                          key={i} 
                          href={article.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-start gap-1.5 text-[10px] text-slate-300 hover:text-blue-400 leading-relaxed group"
                        >
                          <span className="text-slate-500 mt-0.5">•</span>
                          <span className="flex-1 line-clamp-2">{article.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-slate-600 group-hover:text-blue-400 flex-shrink-0 mt-0.5" />
                        </a>
                      ))}
                    </div>
                  )}
                  {/* Parties */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {situation.parties.map((party) => (
                      <span key={party} className="text-[9px] px-1.5 py-0.5 bg-slate-700/50 text-slate-400 rounded">
                        {party}
                      </span>
                    ))}
                  </div>
                  {/* Article count */}
                  <div className="text-[9px] text-slate-500">
                    {situation.articleCount} mentions detected
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
