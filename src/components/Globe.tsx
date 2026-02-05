'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { HotspotData } from '@/types';

const GlobeGL = dynamic(() => import('react-globe.gl'), { ssr: false });

// URL for country borders GeoJSON
const COUNTRIES_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';

interface GlobeProps {
  hotspots: HotspotData[];
  onHotspotClick?: (hotspot: HotspotData) => void;
  onEventClick?: (event: LiveEvent) => void;
}

interface LiveEvent {
  id: string;
  type: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  sourceUrl?: string;
  region?: string;
}

const severityColors: Record<string, string> = {
  low: '#86efac',
  medium: '#fde047',
  high: '#fdba74',
  critical: '#fca5a5',
};

const eventTypeConfig: Record<string, { label: string; color: string }> = {
  missile: { label: 'MISSILE', color: '#ef4444' },
  airstrike: { label: 'AIRSTRIKE', color: '#f97316' },
  drone: { label: 'DRONE', color: '#fb923c' },
  naval: { label: 'NAVAL', color: '#38bdf8' },
  military: { label: 'MILITARY', color: '#f59e0b' },
  protest: { label: 'PROTEST', color: '#a78bfa' },
  cyber: { label: 'CYBER', color: '#22d3ee' },
  terror: { label: 'TERROR', color: '#dc2626' },
  raid: { label: 'RAID', color: '#f472b6' },
  explosion: { label: 'EXPLOSION', color: '#ef4444' },
  shooting: { label: 'SHOOTING', color: '#fb7185' },
  conflict: { label: 'CONFLICT', color: '#f97316' },
  breaking: { label: 'BREAKING', color: '#fbbf24' },
};

// Key conflict relationship arcs (only major ongoing conflicts)
const CONFLICT_ARCS = [
  // Russia -> Ukraine (active war)
  { startLat: 55.75, startLng: 37.62, endLat: 50.45, endLng: 30.52, color: '#ef444466', label: 'RUS-UKR' },
  // Iran -> Israel (proxy conflict)
  { startLat: 35.69, startLng: 51.39, endLat: 31.77, endLng: 35.22, color: '#f9731666', label: 'IRN-ISR' },
  // US -> Middle East (military presence)
  { startLat: 38.9, startLng: -77.04, endLat: 29.31, endLng: 47.48, color: '#3b82f644', label: 'US-ME' },
];

export default function Globe({ hotspots, onHotspotClick, onEventClick }: GlobeProps) {
  const globeRef = useRef<any>(null);
  const [globeReady, setGlobeReady] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<LiveEvent | null>(null);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [arcsData] = useState(CONFLICT_ARCS);
  const [countries, setCountries] = useState<any>({ features: [] });

  // Fetch country borders GeoJSON
  useEffect(() => {
    fetch(COUNTRIES_URL)
      .then(res => res.json())
      .then(data => setCountries(data))
      .catch(err => console.error('Failed to load countries:', err));
  }, []);

  // Fetch live events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const data = await res.json();
          setLiveEvents(data.events || []);
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 120000); // Refresh every 2 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (globeRef.current && globeReady) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.05;
      globeRef.current.pointOfView({ lat: 25, lng: 40, altitude: 2.2 });
    }
  }, [globeReady]);

  // Live event points only (removed hardcoded hotspots) - smaller dots
  const eventPoints = useMemo(() => liveEvents.map((e) => ({
    ...e,
    size: e.severity === 'critical' ? 0.35 : e.severity === 'high' ? 0.28 : 0.2,
    color: eventTypeConfig[e.type]?.color || '#4ade80',
    isHotspot: false,
  })), [liveEvents]);

  const allPoints = useMemo(() => eventPoints, [eventPoints]);

  // Pulsing rings for critical severity events only (reduced to prevent glitchiness)
  const ringsData = useMemo(() => 
    liveEvents.filter((e) => e.severity === 'critical').slice(0, 5).map((e) => ({
      lat: e.lat, lng: e.lng, 
      maxR: 2, 
      propagationSpeed: 1.5, 
      repeatPeriod: 1200,
      color: eventTypeConfig[e.type]?.color || severityColors[e.severity],
    }))
  , [liveEvents]);

  // Country labels for major hotspots - uniform styling
  const countryLabels = useMemo(() => [
    { lat: 48.5, lng: 31.0, label: 'UKRAINE', color: '#94a3b8' },
    { lat: 60.0, lng: 100.0, label: 'RUSSIA', color: '#94a3b8' },
    { lat: 32.5, lng: 53.0, label: 'IRAN', color: '#94a3b8' },
    { lat: 31.0, lng: 35.0, label: 'ISRAEL', color: '#94a3b8' },
    { lat: 35.0, lng: 105.0, label: 'CHINA', color: '#94a3b8' },
    { lat: 23.5, lng: 121.0, label: 'TAIWAN', color: '#94a3b8' },
    { lat: 40.0, lng: 127.0, label: 'DPRK', color: '#94a3b8' },
    { lat: 15.5, lng: 47.5, label: 'YEMEN', color: '#94a3b8' },
    { lat: 35.0, lng: 38.5, label: 'SYRIA', color: '#94a3b8' },
  ], []);

  const handlePointClick = useCallback((point: any) => {
    if (point.isHotspot && onHotspotClick) {
      onHotspotClick(point as HotspotData);
    } else if (!point.isHotspot) {
      setSelectedEvent(point as LiveEvent);
      if (onEventClick) onEventClick(point as LiveEvent);
    }
    // Zoom to point
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.5 }, 1000);
    }
  }, [onHotspotClick, onEventClick]);

  const getPointLabel = useCallback((d: any) => {
    const config = eventTypeConfig[d.type] || { label: 'EVENT', color: '#00ff41' };
    const color = d.isHotspot ? severityColors[d.severity] : config.color;
    return `
      <div style="background: rgba(15,23,42,0.98); border: 1px solid ${color}; padding: 12px; border-radius: 6px; min-width: 220px; font-family: system-ui, sans-serif;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="color: ${color}; font-weight: 700; font-size: 10px; background: ${color}22; padding: 2px 6px; border-radius: 3px;">${d.isHotspot ? 'HOTSPOT' : config.label}</span>
        </div>
        <div style="color: #f1f5f9; font-weight: 600; font-size: 12px; margin-bottom: 6px;">${d.isHotspot ? d.name : d.title}</div>
        <div style="color: #94a3b8; font-size: 11px; line-height: 1.5;">${d.description}</div>
        ${!d.isHotspot && d.source ? `<div style="color: #60a5fa; font-size: 10px; margin-top: 8px;">${d.source}</div>` : ''}
      </div>
    `;
  }, []);

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <GlobeGL
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        // Country polygons for borders - clear land/water distinction
        polygonsData={countries.features}
        polygonCapColor={() => 'rgba(30, 58, 95, 0.85)'}
        polygonSideColor={() => 'rgba(59, 130, 246, 0.3)'}
        polygonStrokeColor={() => 'rgba(147, 197, 253, 0.7)'}
        polygonAltitude={0.006}
        // Points
        pointsData={allPoints}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={(d: any) => d.isHotspot ? 0.015 : 0.025}
        pointRadius="size"
        pointLabel={getPointLabel}
        onPointClick={handlePointClick}
        // Rings
        ringsData={ringsData}
        ringLat="lat"
        ringLng="lng"
        ringColor="color"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        // Arcs - disabled for now
        arcsData={[]}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcStroke={0.5}
        // Labels for key countries - subtle, integrated
        labelsData={countryLabels}
        labelLat="lat"
        labelLng="lng"
        labelText="label"
        labelSize={0.5}
        labelDotRadius={0}
        labelColor={() => 'rgba(148, 163, 184, 0.6)'}
        labelResolution={2}
        labelAltitude={0.008}
        labelIncludeDot={false}
        // Atmosphere - subtle blue glow
        atmosphereColor="#3b82f6"
        atmosphereAltitude={0.15}
        onGlobeReady={() => setGlobeReady(true)}
      />

      {/* World Clocks - Pentagon Style - Hidden on small screens */}
      <div className="absolute top-3 left-3 hidden sm:flex gap-2 z-10">
        <WorldClock timezone="America/New_York" label="DC" />
        <WorldClock timezone="Europe/London" label="LON" />
        <WorldClock timezone="Europe/Moscow" label="MSK" />
        <WorldClock timezone="Asia/Jerusalem" label="TLV" />
        <WorldClock timezone="Asia/Shanghai" label="BEI" />
        <WorldClock timezone="Asia/Tokyo" label="TYO" />
      </div>

      {/* Event Legend - Top right on desktop, bottom left on mobile */}
      <div className="absolute top-3 right-3 sm:top-3 sm:right-3 bg-slate-900/95 border border-slate-700 rounded-lg p-2 sm:p-2.5 text-[8px] sm:text-[9px] z-10">
        <div className="text-slate-400 mb-1.5 font-bold tracking-wider">EVENTS</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {Object.entries(eventTypeConfig).slice(0, 6).map(([type, config]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
              <span className="text-slate-500 text-[8px]">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Event Panel */}
      {selectedEvent && (
        <div className="absolute bottom-28 left-6 bg-slate-800 border border-slate-600 rounded-lg p-5 max-w-[360px] z-20 shadow-2xl">
          <button 
            onClick={() => setSelectedEvent(null)}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-100 text-lg"
          >
            ✕
          </button>
          <div className="mb-3">
            <span 
              className="text-[10px] font-bold px-2 py-1 rounded mb-2 inline-block"
              style={{ 
                color: eventTypeConfig[selectedEvent.type]?.color || '#94a3b8',
                backgroundColor: `${eventTypeConfig[selectedEvent.type]?.color || '#94a3b8'}22`
              }}
            >
              {eventTypeConfig[selectedEvent.type]?.label || 'EVENT'}
            </span>
            <div className="text-slate-100 font-bold text-base leading-tight mt-2">{selectedEvent.title}</div>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">{selectedEvent.description}</p>
          
          {/* Source */}
          <div className="flex items-center gap-3 mb-4 bg-blue-500/15 px-4 py-2.5 rounded-lg">
            <span className="text-xs text-slate-400">SOURCE:</span>
            {selectedEvent.sourceUrl ? (
              <a 
                href={selectedEvent.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 text-sm font-bold hover:underline"
              >
                {selectedEvent.source} ↗
              </a>
            ) : (
              <span className="text-blue-400 text-sm font-bold">{selectedEvent.source}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span 
              className="badge text-xs"
              style={{ 
                backgroundColor: `${severityColors[selectedEvent.severity]}20`,
                color: severityColors[selectedEvent.severity]
              }}
            >
              {selectedEvent.severity}
            </span>
            <span className="text-xs text-slate-400">
              {selectedEvent.type}
            </span>
          </div>
        </div>
      )}

      {/* Event Count - Bottom Right */}
      <div className="absolute bottom-3 right-3 bg-slate-900/90 border border-slate-700 rounded px-3 py-1.5 text-[10px] font-mono">
        {loading ? (
          <span className="text-slate-500">LOADING...</span>
        ) : (
          <>
            <span className="text-slate-500">ACTIVE: </span>
            <span className="text-emerald-400 font-bold">{liveEvents.length}</span>
          </>
        )}
      </div>
    </div>
  );
}

// World Clock Component - Clean Pentagon Style
function WorldClock({ timezone, label }: { timezone: string; label: string }) {
  const [time, setTime] = useState('');
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      setTime(timeStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <div className="bg-slate-900/95 border border-slate-700/50 rounded-md px-2.5 py-1.5 text-center backdrop-blur-sm">
      <div className="text-[7px] text-slate-400 font-bold tracking-[0.2em] mb-0.5">{label}</div>
      <div className="text-[13px] text-amber-400 font-mono font-bold">{time}</div>
    </div>
  );
}
