'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { HotspotData } from '@/types';
import type { GlobeMethods } from 'react-globe.gl';
import { Pause, Play, RotateCcw, X, ArrowUpRight } from 'lucide-react';
import { useEvents, type MapEvent } from '@/lib/use-events';
import { eventTypeConfig, type EventCategory } from '@/lib/event-types';

const GlobeGL = dynamic(() => import('react-globe.gl'), { ssr: false });

// URL for country borders GeoJSON
const COUNTRIES_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';

interface GlobeProps {
  hotspots: HotspotData[];
  onHotspotClick?: (hotspot: HotspotData) => void;
  onEventClick?: (event: MapEvent) => void;
}

const severityColors: Record<string, string> = {
  low: '#16a34a',
  medium: '#ca8a04',
  high: '#ea580c',
  critical: '#dc2626',
};

const LAYERS: { id: 'all' | EventCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'conflict', label: 'Conflict' },
  { id: 'hazard', label: 'Hazards' },
];

// Flat, light map: pale ocean, white land, slate borders.
const OCEAN = '#d6e5f1';
const LAND = '#fbfcfd';

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
  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);
  const [layer, setLayer] = useState<'all' | EventCategory>('all');
  const {items:allEvents,loading,error,counts} = useEvents();
  const liveEvents = useMemo(() => layer === 'all' ? allEvents : allEvents.filter(e => e.category === layer), [allEvents, layer]);
  const [countries, setCountries] = useState<{features:object[]}>({ features: [] });
  const oceanMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: OCEAN }), []);
  const landMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: LAND }), []);

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
      globeRef.current.pointOfView({ lat: 25, lng: 40, altitude: 1.95 });
    }
  }, [globeReady]);

  useEffect(() => { if (globeRef.current && globeReady) globeRef.current.controls().autoRotate = rotating; },[rotating,globeReady]);

  // Marker size reflects severity, so the biggest markers are the ones that matter.
  const eventPoints = useMemo(() => liveEvents.map((e) => {
    const base = { low: 8, medium: 10, high: 12, critical: 15 }[e.severity] ?? 8;
    return { ...e, px: e.category === 'hazard' ? base + 2 : base, color: eventTypeConfig[e.type]?.color || '#0aa5bc' };
  }), [liveEvents]);

  // Legend: the event types currently on the map, most common first
  const legend = useMemo(() => {
    const tally: Record<string, number> = {};
    for (const e of liveEvents) tally[e.type] = (tally[e.type] || 0) + 1;
    return Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [liveEvents]);

  // Country labels for major hotspots
  const countryLabels = useMemo(() => [
    { lat: 48.5, lng: 31.0, label: 'UKRAINE' },
    { lat: 60.0, lng: 100.0, label: 'RUSSIA' },
    { lat: 32.5, lng: 53.0, label: 'IRAN' },
    { lat: 31.0, lng: 35.0, label: 'ISRAEL' },
    { lat: 35.0, lng: 105.0, label: 'CHINA' },
    { lat: 23.5, lng: 121.0, label: 'TAIWAN' },
    { lat: 40.0, lng: 127.0, label: 'DPRK' },
    { lat: 15.5, lng: 47.5, label: 'YEMEN' },
    { lat: 35.0, lng: 38.5, label: 'SYRIA' },
  ], []);

  const handlePointClick = useCallback((data: object) => {
    const point = data as MapEvent;
    setSelectedEvent(point);
    if (onEventClick) onEventClick(point);
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.5 }, 1000);
    }
  }, [onEventClick]);
  void onHotspotClick;

  // Each event is a small DOM marker: filled dot for conflict, ring for natural hazards,
  // with a hover card. Text is set with textContent, so feed content is never parsed as HTML.
  const makeMarker = useCallback((data: object) => {
    const d = data as MapEvent & { px: number; color: string };
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `gm gm-${d.category} gm-${d.severity}`;
    el.dataset.id = d.id;
    el.style.setProperty('--c', d.color);
    el.style.setProperty('--s', d.px + 'px');
    el.setAttribute('aria-label', d.title);
    const tip = document.createElement('span');
    tip.className = 'gm-tip';
    const kind = document.createElement('b');
    kind.textContent = (eventTypeConfig[d.type]?.label || 'Event').toLowerCase();
    const title = document.createElement('span');
    title.textContent = d.title;
    tip.append(kind, title);
    el.append(tip);
    el.addEventListener('click', (ev) => { ev.stopPropagation(); handlePointClick(d); });
    return el;
  }, [handlePointClick]);

  // Highlight the selected marker without rebuilding all of them
  useEffect(() => {
    const root = container.current;
    if (!root) return;
    root.querySelectorAll('.gm.is-selected').forEach(n => n.classList.remove('is-selected'));
    if (selectedEvent) root.querySelector(`.gm[data-id="${CSS.escape(selectedEvent.id)}"]`)?.classList.add('is-selected');
  }, [selectedEvent, eventPoints]);

  return (
    <div ref={container} className="globe-root">
      {size.width > 0 && size.height > 0 && <div className="globe-canvas"><GlobeGL
        width={size.width}
        height={size.height}
        backgroundColor="rgba(0,0,0,0)"
        ref={globeRef}
        globeMaterial={oceanMaterial}
        // Country polygons for borders: white land on pale ocean
        polygonsData={countries.features}
        polygonCapMaterial={landMaterial}
        polygonSideColor={() => 'rgba(100, 116, 139, 0.12)'}
        polygonStrokeColor={() => 'rgba(100, 116, 139, 0.45)'}
        polygonAltitude={0.006}
        // Event markers (DOM elements, hidden when on the far side of the globe)
        htmlElementsData={eventPoints}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={0.01}
        htmlElement={makeMarker}
        htmlElementVisibilityModifier={(el, visible) => { el.style.opacity = visible ? '1' : '0'; el.style.pointerEvents = visible ? 'auto' : 'none'; }}
        htmlTransitionDuration={0}
        // Labels for key countries
        labelsData={countryLabels}
        labelLat="lat"
        labelLng="lng"
        labelText="label"
        labelSize={0.5}
        labelDotRadius={0}
        labelColor={() => 'rgba(51, 65, 85, 0.55)'}
        labelResolution={2}
        labelAltitude={0.008}
        labelIncludeDot={false}
        // Soft blue atmosphere
        atmosphereColor="#7cc4e4"
        atmosphereAltitude={0.14}
        onGlobeReady={() => setGlobeReady(true)}
      /></div>}

      <div className="layer-chips" role="group" aria-label="Event layers">
        {LAYERS.map(l => <button key={l.id} aria-pressed={layer === l.id} onClick={() => { setLayer(l.id); setSelectedEvent(null); }}>
          {l.label}<b>{l.id === 'all' ? counts.conflict + counts.hazard : counts[l.id]}</b>
        </button>)}
      </div>

      <div className="world-clocks">
        <WorldClock timezone="America/New_York" label="DC" />
        <WorldClock timezone="Europe/London" label="LON" />
        <WorldClock timezone="Asia/Shanghai" label="BEI" />
        <WorldClock timezone="Asia/Tokyo" label="TYO" />
      </div>

      <div className="event-legend">
        <div className="event-legend-items">
          {legend.map(([type, n]) => (
            <div key={type}>
              <i style={{ backgroundColor: eventTypeConfig[type]?.color || '#94a3b8' }} />
              <span>{(eventTypeConfig[type]?.label || type).toLowerCase()}</span><b>{n}</b>
            </div>
          ))}
        </div>
      </div>

      {selectedEvent && (
        <div className="selected-event" role="dialog" aria-label="Event details">
          <button className="sheet-close" aria-label="Close event details" onClick={() => setSelectedEvent(null)}>
            <X size={18} />
          </button>
          <span
            className="event-type"
            style={{
              color: eventTypeConfig[selectedEvent.type]?.color || '#475569',
              backgroundColor: `${eventTypeConfig[selectedEvent.type]?.color || '#475569'}1a`
            }}
          >
            {(eventTypeConfig[selectedEvent.type]?.label || 'Event').toLowerCase()}
          </span>
          <h3>{selectedEvent.title}</h3>
          <p>{selectedEvent.description}</p>
          <div className="event-footer">
            <span className="event-severity" style={{ color: severityColors[selectedEvent.severity] }}>
              <i style={{ backgroundColor: severityColors[selectedEvent.severity] }} />{selectedEvent.magnitude || selectedEvent.severity + ' severity'}
            </span>
            {selectedEvent.sourceUrl ? (
              <a href={selectedEvent.sourceUrl} target="_blank" rel="noopener noreferrer">
                {selectedEvent.source} <ArrowUpRight size={14} />
              </a>
            ) : (
              <span>{selectedEvent.source}</span>
            )}
          </div>
        </div>
      )}

      <div className="globe-tools">
        <div className="globe-tool-buttons">
          <button className="icon-button" aria-label={rotating ? 'Pause globe rotation':'Rotate globe'} aria-pressed={rotating} onClick={() => setRotating(!rotating)}>{rotating ? <Pause size={14}/> : <Play size={14}/>}</button>
          <button className="icon-button" aria-label="Reset globe view" onClick={() => { globeRef.current?.pointOfView({lat:25,lng:40,altitude:1.95},800); setSelectedEvent(null); }}><RotateCcw size={14}/></button>
        </div>
        <span className="event-count" role="status">{error ? 'Events unavailable' : loading && !liveEvents.length ? 'Loading events…' : liveEvents.length + ' events'}</span>
      </div>
    </div>
  );
}

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
