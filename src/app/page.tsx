'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import StatusBar from '@/components/StatusBar';
import NewsFeed from '@/components/NewsFeed';
import MarketOdds from '@/components/MarketOdds';
import CurrentSituations from '@/components/CurrentSituations';
import PopoutButton from '@/components/PopoutButton';
import DefconIndicator from '@/components/DefconIndicator';
import FinancialIndicators from '@/components/FinancialIndicators';
import TelegramFeed from '@/components/XFeed';
import { HOTSPOTS } from '@/lib/constants';
import { HotspotData, ThreatLevel } from '@/types';
import { Maximize2, Minimize2, Volume2, VolumeX, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

const Globe = dynamic(() => import('@/components/Globe'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
      Initializing globe...
    </div>
  ),
});

export default function Home() {
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotData | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [layout, setLayout] = useState<'balanced' | 'globe' | 'feed'>('balanced');
  const [hiddenPanels, setHiddenPanels] = useState<Set<'intel' | 'markets'>>(new Set());

  const togglePanel = (panel: 'intel' | 'markets') => {
    setHiddenPanels(prev => {
      const next = new Set(prev);
      if (next.has(panel)) {
        next.delete(panel);
      } else {
        next.add(panel);
      }
      return next;
    });
  };

  const hotspots: HotspotData[] = useMemo(() => 
    HOTSPOTS.map(h => ({ ...h, newsCount: Math.floor(Math.random() * 20) + 1 })),
    []
  );

  const activeRegions = hotspots.filter(h => h.severity === 'critical' || h.severity === 'high').length;

  const handleHotspotClick = (hotspot: HotspotData) => {
    setSelectedHotspot(hotspot);
  };

  return (
    <div className="h-screen sm:h-screen min-h-[100dvh] w-screen flex flex-col bg-slate-950 gradient-bg tactical-grid overflow-hidden">
      {/* Status Bar */}
      <StatusBar activeRegions={activeRegions} uplink="ONLINE" />

      {/* Main Content - stacked on mobile, side-by-side on desktop */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
        {/* Left Panel - News Feed */}
        <div className={`h-[20dvh] sm:h-full flex-shrink-0 flex flex-col border-b sm:border-b-0 sm:border-r border-slate-800/50 premium-card sm:corner-brackets sm:breathe-glow overflow-hidden sm:order-1 order-2 transition-all duration-300 ${hiddenPanels.has('intel') ? 'sm:w-[40px]' : layout === 'feed' ? 'sm:w-[500px]' : layout === 'globe' ? 'sm:w-[200px]' : 'sm:w-[320px]'}`}>
          {/* Panel Header */}
          <div className="hidden sm:flex h-6 bg-slate-900/80 border-b border-slate-700/50 items-center justify-between px-2 flex-shrink-0">
            {!hiddenPanels.has('intel') && (
              <span className="text-amber-400 text-[9px] font-bold tracking-widest">INTEL FEED</span>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => togglePanel('intel')}
                className="p-0.5 hover:bg-slate-700/50 rounded transition-colors"
                title={hiddenPanels.has('intel') ? 'Expand panel' : 'Collapse panel'}
              >
                {hiddenPanels.has('intel') ? (
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                ) : (
                  <ChevronLeft className="w-3 h-3 text-slate-400" />
                )}
              </button>
              {!hiddenPanels.has('intel') && <PopoutButton panel="intel" />}
            </div>
          </div>
          {!hiddenPanels.has('intel') && (
            <div className="flex-1 overflow-hidden">
              <NewsFeed />
            </div>
          )}
          {hiddenPanels.has('intel') && (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-amber-400 text-[9px] font-bold tracking-widest writing-mode-vertical rotate-180" style={{ writingMode: 'vertical-rl' }}>INTEL</span>
            </div>
          )}
        </div>

        {/* Center Panel - Globe & Map */}
        <div className="h-[25dvh] sm:h-full sm:flex-1 flex flex-col sm:min-w-[400px] sm:order-2 order-1">
          {/* Panel Header */}
          <div className="hidden sm:flex h-6 bg-slate-900/80 border-b border-slate-700/50 items-center justify-between px-2 flex-shrink-0">
            <span className="text-emerald-400 text-[9px] font-bold tracking-widest">GLOBAL SITUATIONAL AWARENESS</span>
            <div className="flex items-center gap-1">
              <PopoutButton panel="globe" />
            </div>
          </div>
          {/* Globe Area */}
          <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
            <Globe hotspots={hotspots} onHotspotClick={handleHotspotClick} />

            {/* Live indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-slate-900/90 px-3 py-1 rounded border border-emerald-500/30 border-glow">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full live-indicator" />
              <span className="text-emerald-400 text-[8px] font-bold tracking-widest glow-text">LIVE</span>
            </div>

            {/* Selected hotspot info - hidden on mobile */}
            {selectedHotspot && (
              <div className="hidden sm:block absolute bottom-20 left-6 bg-slate-800 border border-slate-600 p-4 max-w-[260px] z-10 rounded-lg shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-3 h-3 rounded-full animate-pulse-dot"
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

        {/* Right Panel - Situations + Markets */}
        <div className={`h-[40dvh] sm:h-full flex-shrink-0 flex flex-col border-t sm:border-t-0 sm:border-l border-slate-800/50 premium-card sm:corner-brackets sm:breathe-glow order-3 transition-all duration-300 ${hiddenPanels.has('markets') ? 'sm:w-[40px]' : layout === 'globe' ? 'sm:w-[200px]' : 'sm:w-[320px]'}`}>
          {/* Panel Header */}
          <div className="hidden sm:flex h-6 bg-slate-900/80 border-b border-slate-700/50 items-center justify-between px-2 flex-shrink-0">
            {!hiddenPanels.has('markets') && (
              <span className="text-blue-400 text-[9px] font-bold tracking-widest">MARKETS</span>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => togglePanel('markets')}
                className="p-0.5 hover:bg-slate-700/50 rounded transition-colors"
                title={hiddenPanels.has('markets') ? 'Expand panel' : 'Collapse panel'}
              >
                {hiddenPanels.has('markets') ? (
                  <ChevronLeft className="w-3 h-3 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                )}
              </button>
              {!hiddenPanels.has('markets') && <PopoutButton panel="markets" />}
            </div>
          </div>
          {!hiddenPanels.has('markets') && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Active Situations - Compact */}
              <div className="h-[80px] sm:h-[100px] border-b border-slate-700/50 overflow-y-auto flex-shrink-0">
                <CurrentSituations />
              </div>
              
              {/* Prediction Markets - Takes remaining space */}
              <div className="flex-1 overflow-y-auto min-h-[80px]">
                <MarketOdds />
              </div>
            </div>
          )}
          {hiddenPanels.has('markets') && (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-blue-400 text-[9px] font-bold tracking-widest" style={{ writingMode: 'vertical-rl' }}>MARKETS</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status - Premium */}
      <div className="status-bar flex items-center justify-between px-4 py-1 text-[8px] flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            ONLINE
          </span>
          <span className="text-slate-700">│</span>
          <span className="text-blue-400 font-mono">FEEDS:38</span>
          <span className="text-slate-700">│</span>
          <span className="text-amber-400 font-mono">MKTS:20</span>
        </div>
        
        {/* Layout Controls */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => setLayout('balanced')}
            className={`px-2 py-0.5 rounded text-[8px] font-bold transition-colors ${layout === 'balanced' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            BALANCED
          </button>
          <button
            onClick={() => setLayout('globe')}
            className={`px-2 py-0.5 rounded text-[8px] font-bold transition-colors ${layout === 'globe' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            GLOBE
          </button>
          <button
            onClick={() => setLayout('feed')}
            className={`px-2 py-0.5 rounded text-[8px] font-bold transition-colors ${layout === 'feed' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            FEED
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Audio Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-1 hover:bg-slate-700/50 rounded transition-colors"
            title={audioEnabled ? 'Mute alerts' : 'Enable alerts'}
          >
            {audioEnabled ? (
              <Volume2 className="w-3 h-3 text-emerald-400" />
            ) : (
              <VolumeX className="w-3 h-3 text-slate-500" />
            )}
          </button>
          
          {/* Fullscreen Toggle */}
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
                setIsFullscreen(true);
              } else {
                document.exitFullscreen();
                setIsFullscreen(false);
              }
            }}
            className="p-1 hover:bg-slate-700/50 rounded transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3 h-3 text-slate-400" />
            ) : (
              <Maximize2 className="w-3 h-3 text-slate-400" />
            )}
          </button>
          
          <span className="text-slate-700">│</span>
          <span className="text-slate-500 font-mono">UNCLASSIFIED</span>
          <span className="text-slate-700">│</span>
          <span className="text-blue-400 font-mono">v3.2</span>
        </div>
      </div>
    </div>
  );
}
