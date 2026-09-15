'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { HotspotData } from '@/types';
import type { GlobeMethods } from 'react-globe.gl';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useFeed } from '@/lib/use-feed';

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

export default function Globe({ onHotspotClick, onEventClick }: GlobeProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const container = useRef<HTMLDivElement>(null);
  const [size,setSize] = useState({width:0,height:0});
  const [rotating,setRotating] = useState(false);
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(([entry]) => setSize({width:Math.floor(entry.contentRect.width),height:Math.floor(entry.contentRect.height)}));
    observer.observe(container.current);
    return () => observer.disconnect();
  },[]);
  const [globeReady, setGlobeReady] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<LiveEvent | null>(null);
  const {items:liveEvents,loading,error} = useFeed<LiveEvent>('/api/events','events',120000);
  const [countries, setCountries] = useState<{features:object[]}>({ features: [] });

  // Fetch country borders GeoJSON
  useEffect(() => {
    fetch(COUNTRIES_URL)
      .then(res => res.json())
      .then(data => setCountries(data))
      .catch(err => console.error('Failed to load countries:', err));
  }, []);

  useEffect(() => {
    if (globeRef.current && globeReady) {
      globeRef.current.controls().autoRotate = false;
      globeRef.current.controls().autoRotateSpeed = 0.05;
      globeRef.current.pointOfView({ lat: 25, lng: 40, altitude: 2.2 });
    }
  }, [globeReady]);

  useEffect(() => { if (globeRef.current && globeReady) globeRef.current.controls().autoRotate = rotating; },[rotating,globeReady]);

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

  const handlePointClick = useCallback((data: object) => {
    const point = data as LiveEvent & {isHotspot?: boolean};
    if (point.isHotspot && onHotspotClick) {
      onHotspotClick(point as unknown as HotspotData);
    } else if (!point.isHotspot) {
      setSelectedEvent(point as LiveEvent);
      if (onEventClick) onEventClick(point as LiveEvent);
    }
    // Zoom to point
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.5 }, 1000);
    }
  }, [onHotspotClick, onEventClick]);

  const getPointLabel = useCallback((data: object) => {
    const d = data as LiveEvent & {isHotspot?: boolean; name?: string};
    const escape = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
    const config = eventTypeConfig[d.type] || { label: 'EVENT', color: '#00ff41' };
    const color = d.isHotspot ? severityColors[d.severity] : config.color;
    return `
      <div style="background: rgba(15,23,42,0.98); border: 1px solid ${color}; padding: 12px; border-radius: 6px; min-width: 220px; font-family: system-ui, sans-serif;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="color: ${color}; font-weight: 700; font-size: 10px; background: ${color}22; padding: 2px 6px; border-radius: 3px;">${d.isHotspot ? 'HOTSPOT' : config.label}</span>
        </div>
        <div style="color: #f1f5f9; font-weight: 600; font-size: 12px; margin-bottom: 6px;">${escape(d.isHotspot ? d.name : d.title)}</div>
        <div style="color: #94a3b8; font-size: 11px; line-height: 1.5;">${escape(d.description)}</div>
        ${!d.isHotspot && d.source ? `<div style="color: #60a5fa; font-size: 10px; margin-top: 8px;">${escape(d.source)}</div>` : ''}
      </div>
    `;
  }, []);

  return (
    <div ref={container} className="w-full h-full relative flex items-center justify-center">
      {size.width > 0 && size.height > 0 && <GlobeGL
        width={size.width}
        height={size.height}
        backgroundColor="rgba(0,0,0,0)"
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        // Country polygons for borders - clear land/water distinction
        polygonsData={countries.features}
        polygonCapColor={() => 'rgba(62, 74, 89, 0.65)'}
        polygonSideColor={() => 'rgba(110, 130, 156, 0.2)'}
        polygonStrokeColor={() => 'rgba(160, 178, 203, 0.4)'}
        polygonAltitude={0.006}
        // Points
        pointsData={allPoints}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={0.025}
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
        atmosphereColor="#7c95b5"
        atmosphereAltitude={0.1}
        onGlobeReady={() => setGlobeReady(true)}
      />}

      {/* World Clocks - Pentagon Style - Hidden on small screens */}
      <div className="world-clocks">
        <WorldClock timezone="America/New_York" label="DC" />
        <WorldClock timezone="Europe/London" label="LON" />
        <WorldClock timezone="Asia/Shanghai" label="BEI" />
        <WorldClock timezone="Asia/Tokyo" label="TYO" />
      </div>

      {/* Event Legend - Top right on desktop, bottom left on mobile */}
      <div className="event-legend">
        <div className="event-legend-title">EVENTS</div>
        <div className="event-legend-items">
          {Object.entries(eventTypeConfig).slice(0, 6).map(([type, config]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
              <span >{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Event Panel */}
      {selectedEvent && (
        <div className="selected-event">
          <button 
            aria-label="Close event details"
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

      <div className="globe-tools">
        <div className="globe-tool-buttons">
          <button className="icon-button" aria-label={rotating ? 'Pause globe rotation':'Rotate globe'} aria-pressed={rotating} onClick={() => setRotating(!rotating)}>{rotating ? <Pause size={14}/> : <Play size={14}/>}</button>
          <button className="icon-button" aria-label="Reset globe view" onClick={() => { globeRef.current?.pointOfView({lat:25,lng:40,altitude:2.2},800); setSelectedEvent(null); }}><RotateCcw size={14}/></button>
        </div>
        <span className="event-count" role="status">{error ? 'Events unavailable' : loading ? 'Updating events…' : liveEvents.length + ' mapped events'}</span>
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
    <div className="world-clock"><small>{label}</small><span>{time || '—'}</span></div>
  );
}

