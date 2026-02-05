'use client';

import NewsFeed from '@/components/NewsFeed';

export default function IntelPopout() {
  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="h-8 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 flex-shrink-0">
        <span className="text-amber-400 text-xs font-bold tracking-widest">INTEL FEED</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-400 text-[10px]">RECEIVING</span>
        </div>
      </div>
      
      {/* Feed */}
      <div className="flex-1 overflow-hidden">
        <NewsFeed />
      </div>
    </div>
  );
}
