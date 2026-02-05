'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { HOTSPOTS } from '@/lib/constants';
import { HotspotData } from '@/types';

const Globe = dynamic(() => import('@/components/Globe'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
      Initializing globe...
    </div>
  ),
});

export default function GlobePopout() {
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotData | null>(null);

  const hotspots: HotspotData[] = useMemo(() => 
    HOTSPOTS.map(h => ({ ...h, newsCount: Math.floor(Math.random() * 20) + 1 })),
    []
  );

  const handleHotspotClick = (hotspot: HotspotData) => {
    setSelectedHotspot(hotspot);
  };

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="h-8 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 flex-shrink-0">
        <span className="text-emerald-400 text-xs font-bold tracking-widest">GLOBE VIEW</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-400 text-[10px]">LIVE</span>
        </div>
      </div>
      
      {/* Globe */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <Globe hotspots={hotspots} onHotspotClick={handleHotspotClick} />
        
        {selectedHotspot && (
          <div className="absolute bottom-6 left-6 bg-slate-800/95 border border-slate-600 p-4 max-w-[300px] z-10 rounded-lg shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ 
                  backgroundColor: selectedHotspot.severity === 'critical' ? '#fca5a5' : 
                                   selectedHotspot.severity === 'high' ? '#fdba74' : '#fde047' 
                }}
              />
              <span className="text-slate-100 text-sm font-bold">{selectedHotspot.name}</span>
            </div>
            <p className="text-slate-300 text-sm">{selectedHotspot.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
