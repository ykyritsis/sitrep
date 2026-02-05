'use client';

import MarketOdds from '@/components/MarketOdds';
import CurrentSituations from '@/components/CurrentSituations';

export default function MarketsPopout() {
  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="h-8 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 flex-shrink-0">
        <span className="text-blue-400 text-xs font-bold tracking-widest">PREDICTION MARKETS</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-400 text-[10px]">LIVE</span>
        </div>
      </div>
      
      {/* Situations */}
      <div className="h-[150px] border-b border-slate-700 overflow-y-auto flex-shrink-0">
        <CurrentSituations />
      </div>
      
      {/* Markets */}
      <div className="flex-1 overflow-y-auto">
        <MarketOdds />
      </div>
    </div>
  );
}
