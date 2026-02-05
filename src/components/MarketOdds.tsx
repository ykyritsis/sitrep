'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface MarketAnswer {
  id: string;
  text: string;
  probability: number;
}

interface MarketData {
  id: string;
  question: string;
  probability: number;
  volume: number;
  category: string;
  url?: string;
  outcomeType?: string;
  answers?: MarketAnswer[];
}

export default function MarketOdds() {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMarket, setExpandedMarket] = useState<string | null>(null);

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/markets');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setMarkets(data.markets || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch markets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 300000);
    return () => clearInterval(interval);
  }, []);

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `M$${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `M$${(vol / 1000).toFixed(0)}K`;
    return `M$${Math.round(vol)}`;
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 0.7) return 'text-red-400';
    if (prob >= 0.4) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getProbabilityBg = (prob: number) => {
    if (prob >= 0.7) return 'bg-red-500/15';
    if (prob >= 0.4) return 'bg-amber-500/15';
    return 'bg-emerald-500/15';
  };

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* Header - Premium Pentagon Style */}
      <div className="px-4 py-3 border-b border-slate-700/50 bg-gradient-to-r from-slate-900 via-slate-800/50 to-slate-900">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400 neon-blue" />
            <span className="text-blue-400 text-[11px] font-bold tracking-[0.15em]">PREDICTION MARKETS</span>
          </div>
          <button 
            onClick={fetchMarkets} 
            className="text-slate-400 hover:text-blue-400 transition-all p-1.5 hover:bg-blue-500/10 rounded border border-transparent hover:border-blue-500/30"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="text-[8px] text-slate-500 font-mono tracking-wider">POLYMARKET LIVE ODDS</div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {error && <div className="p-4 text-red-400 text-sm bg-red-500/10">{error}</div>}
        
        {loading && markets.length === 0 ? (
          <div className="p-4 text-slate-400 text-sm">Loading markets...</div>
        ) : markets.length === 0 ? (
          <div className="p-4 text-slate-400 text-sm">No markets available</div>
        ) : (
          <div>
            {markets
              .sort((a, b) => (b.volume || 0) - (a.volume || 0))
              .map((market) => {
              const hasAnswers = market.answers && market.answers.length > 0;
              const isExpanded = expandedMarket === market.id;
              
              return (
                <div key={market.id} className="border-b border-slate-800/30 last:border-b-0">
                  <div 
                    className="intel-item px-3 py-2.5 cursor-pointer transition-all"
                    onClick={() => hasAnswers ? setExpandedMarket(isExpanded ? null : market.id) : window.open(market.url, '_blank')}
                  >
                    {/* Question */}
                    <p className="text-[10px] text-slate-200 leading-snug mb-1.5 font-medium">
                      {market.question}
                    </p>
                    
                    {/* Meta row with probability bar */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[9px]">
                        <span className="text-emerald-400 font-mono font-bold">{formatVolume(market.volume)}</span>
                        {hasAnswers && (
                          <span className="text-slate-500 flex items-center gap-0.5">
                            {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                            {market.answers!.length} opts
                          </span>
                        )}
                      </div>
                      {!hasAnswers && (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden odds-bar">
                            <div 
                              className={`h-full rounded-full transition-all ${market.probability >= 0.7 ? 'bg-red-500' : market.probability >= 0.4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${market.probability * 100}%` }}
                            />
                          </div>
                          <span className={`text-[11px] font-bold font-mono ${getProbabilityColor(market.probability)}`}>
                            {(market.probability * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Expanded Answers - cleaner layout */}
                  {isExpanded && hasAnswers && (
                    <div className="px-3 pb-2 bg-slate-800/20">
                      {market.answers!.map((answer, idx) => (
                        <div key={answer.id} className="flex items-center justify-between py-1 border-b border-slate-800/50 last:border-b-0">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-[9px] text-slate-500 w-4">{idx + 1}.</span>
                            <span className="text-[10px] text-slate-300 truncate">{answer.text}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div 
                              className="h-1.5 rounded-full bg-slate-700" 
                              style={{ width: '40px' }}
                            >
                              <div 
                                className={`h-full rounded-full ${answer.probability >= 0.5 ? 'bg-amber-500' : 'bg-slate-500'}`}
                                style={{ width: `${answer.probability * 100}%` }}
                              />
                            </div>
                            <span className={`text-[10px] font-bold w-8 text-right ${getProbabilityColor(answer.probability)}`}>
                              {(answer.probability * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                      <a 
                        href={market.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[9px] text-blue-400 hover:underline block mt-2"
                      >
                        View on Polymarket →
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
