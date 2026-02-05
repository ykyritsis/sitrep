'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { RefreshCw, Radio } from 'lucide-react';
import { NewsItem, RelatedArticle } from '@/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface NewsFeedProps {
  category?: string;
}

// Source config with colors and country flags
const sourceConfig: Record<string, { bg: string; text: string; flag: string }> = {
  // US Sources
  'Fox News': { bg: 'bg-red-600/20', text: 'text-red-300', flag: '🇺🇸' },
  CNN: { bg: 'bg-red-500/20', text: 'text-red-400', flag: '🇺🇸' },
  NBC: { bg: 'bg-purple-500/20', text: 'text-purple-400', flag: '🇺🇸' },
  CBS: { bg: 'bg-blue-500/20', text: 'text-blue-400', flag: '🇺🇸' },
  ABC: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', flag: '🇺🇸' },
  NYT: { bg: 'bg-slate-500/20', text: 'text-slate-300', flag: '🇺🇸' },
  'New York Times': { bg: 'bg-slate-500/20', text: 'text-slate-300', flag: '🇺🇸' },
  AP: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', flag: '🇺🇸' },
  UPI: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', flag: '🇺🇸' },
  'War Zone': { bg: 'bg-green-600/20', text: 'text-green-400', flag: '🇺🇸' },
  'Breaking Defense': { bg: 'bg-green-500/20', text: 'text-green-400', flag: '🇺🇸' },
  'Washington Post': { bg: 'bg-slate-500/20', text: 'text-slate-300', flag: '🇺🇸' },
  Politico: { bg: 'bg-red-500/20', text: 'text-red-400', flag: '🇺🇸' },
  // UK Sources
  BBC: { bg: 'bg-blue-500/20', text: 'text-blue-400', flag: '🇬🇧' },
  Guardian: { bg: 'bg-blue-600/20', text: 'text-blue-300', flag: '🇬🇧' },
  'The Guardian': { bg: 'bg-blue-600/20', text: 'text-blue-300', flag: '🇬🇧' },
  Reuters: { bg: 'bg-orange-500/20', text: 'text-orange-400', flag: '🇬🇧' },
  // Middle East
  'Al Jazeera': { bg: 'bg-amber-500/20', text: 'text-amber-400', flag: '🇶🇦' },
  'Al Arabiya': { bg: 'bg-amber-600/20', text: 'text-amber-300', flag: '🇸🇦' },
  'Times of Israel': { bg: 'bg-blue-400/20', text: 'text-blue-300', flag: '🇮🇱' },
  'Jerusalem Post': { bg: 'bg-blue-500/20', text: 'text-blue-400', flag: '🇮🇱' },
  // Ukraine/Russia
  'Kyiv Independent': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', flag: '🇺🇦' },
  'Ukr Pravda': { bg: 'bg-yellow-600/20', text: 'text-yellow-300', flag: '🇺🇦' },
  Meduza: { bg: 'bg-purple-500/20', text: 'text-purple-400', flag: '🇷🇺' },
  // Europe
  France24: { bg: 'bg-blue-500/20', text: 'text-blue-400', flag: '🇫🇷' },
  DW: { bg: 'bg-slate-400/20', text: 'text-slate-300', flag: '🇩🇪' },
  Euronews: { bg: 'bg-blue-400/20', text: 'text-blue-300', flag: '🇪🇺' },
  'Politico EU': { bg: 'bg-red-500/20', text: 'text-red-400', flag: '🇪🇺' },
  // Asia
  SCMP: { bg: 'bg-red-400/20', text: 'text-red-300', flag: '🇭🇰' },
  'NHK Japan': { bg: 'bg-red-500/20', text: 'text-red-400', flag: '🇯🇵' },
  'Yonhap Korea': { bg: 'bg-blue-500/20', text: 'text-blue-400', flag: '🇰🇷' },
  'CNA Singapore': { bg: 'bg-red-500/20', text: 'text-red-400', flag: '🇸🇬' },
  // Australia
  'ABC Australia': { bg: 'bg-orange-500/20', text: 'text-orange-400', flag: '🇦🇺' },
  // Default/Breaking
  Breaking: { bg: 'bg-red-500/20', text: 'text-red-400', flag: '🌐' },
};

const getSourceStyle = (source: string) => {
  return sourceConfig[source] || { bg: 'bg-slate-500/20', text: 'text-slate-400', flag: '🌐' };
};

export default function NewsFeed({ category = 'all' }: NewsFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/news?category=${category}`);
      if (!res.ok) throw new Error('Failed to fetch news');
      const data = await res.json();
      setNews(data.items || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch intelligence feed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'badge badge-critical';
      case 'high': return 'badge badge-high';
      case 'medium': return 'badge badge-medium';
      default: return 'badge badge-low';
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* Header - Premium Pentagon Style */}
      <div className="px-4 py-3 border-b border-slate-700/50 bg-gradient-to-r from-slate-900 via-slate-800/50 to-slate-900">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400 live-indicator neon-amber" />
            <span className="text-amber-400 text-[11px] font-bold tracking-[0.2em] amber-glow">INTEL FEED</span>
          </div>
          <button
            onClick={fetchNews}
            className="text-slate-400 hover:text-blue-400 transition-all p-1.5 hover:bg-blue-500/10 rounded border border-transparent hover:border-blue-500/30"
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-slate-500 font-mono tracking-wider">LAST SYNC: <span className="text-blue-400">{format(lastUpdated, 'HH:mm:ss')}</span></span>
          <span className="text-emerald-400 flex items-center gap-1.5 neon-green">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            RECEIVING
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="p-4 text-red-400 text-sm bg-red-500/10">{error}</div>
        )}
        
        {loading && news.length === 0 && (
          <div className="p-4 text-slate-400 text-sm">Loading news...</div>
        )}

        <div>
          {news.map((item) => {
            // Clean up title - remove source suffix, trim length
            let cleanTitle = item.title
              .replace(/ - [A-Za-z\s]+$/, '') // Remove " - Source Name"
              .replace(/\s*\|.*$/, '') // Remove " | anything"
              .replace(/\s*–.*$/, '') // Remove " – anything"
              .trim();
            if (cleanTitle.length > 100) {
              cleanTitle = cleanTitle.substring(0, 97) + '...';
            }
            
            const hasRelated = item.relatedArticles && item.relatedArticles.length > 0;
            const isExpanded = expandedId === item.id;
            
            return (
              <div key={item.id} className="border-b border-slate-800/30">
                <div
                  onClick={(e) => {
                    if (hasRelated) {
                      e.preventDefault();
                      setExpandedId(isExpanded ? null : item.id);
                    }
                  }}
                  className={`intel-item block px-3 py-2.5 transition-all fade-in-up ${hasRelated ? 'cursor-pointer' : ''}`}
                >
                  {/* Severity indicator + Title */}
                  <div className="flex items-start gap-2">
                    {(item.severity === 'critical' || item.severity === 'high') && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        item.severity === 'critical' ? 'bg-red-500 live-indicator' : 'bg-orange-500'
                      }`} />
                    )}
                    <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex-1">
                      <h3 className="text-[11px] text-slate-200 leading-tight font-medium hover:text-blue-400">
                        {cleanTitle}
                      </h3>
                    </a>
                    {hasRelated && (
                      <span className="text-slate-500 flex-shrink-0">
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </span>
                    )}
                  </div>

                  {/* Meta row with source badge and flag */}
                  <div className="flex items-center gap-2 text-[9px] mt-1.5 ml-3.5">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center gap-1 ${getSourceStyle(item.source).bg} ${getSourceStyle(item.source).text}`}>
                      <span>{getSourceStyle(item.source).flag}</span>
                      {item.source}
                    </span>
                    <span className="text-slate-500">
                      {formatDistanceToNow(new Date(item.pubDate), { addSuffix: false })}
                    </span>
                    {hasRelated && (
                      <span className="text-slate-600 text-[8px]">
                        +{item.relatedArticles!.length} sources
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Related articles dropdown */}
                {isExpanded && item.relatedArticles && (
                  <div className="bg-slate-900/50 border-t border-slate-800/50 px-3 py-2 space-y-1.5">
                    {item.relatedArticles.map((related, idx) => (
                      <a
                        key={idx}
                        href={related.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[10px] text-slate-400 hover:text-blue-400 py-1"
                      >
                        <span className={`px-1 py-0.5 rounded text-[7px] font-bold flex items-center gap-0.5 ${getSourceStyle(related.source).bg} ${getSourceStyle(related.source).text}`}>
                          <span>{getSourceStyle(related.source).flag}</span>
                          {related.source}
                        </span>
                        <span className="flex-1 truncate">{related.title.replace(/ - [A-Za-z\s]+$/, '').substring(0, 60)}...</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
