'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { HotspotData } from '@/types';
import type { GlobeMethods } from 'react-globe.gl';
import { Pause, Play, RotateCcw, X, ArrowUpRight } from 'lucide-react';
import { useEvents, type MapEvent } from '@/lib/use-events';
import { eventTypeConfig, type EventCategory } from '@/lib/event-types';
import { mapTexture } from '@/lib/globe-texture';
import { createMarkerLayer, setMarkers, pickMarker, type MarkerLayer } from '@/lib/globe-markers';

const GlobeGL = dynamic(() => import('react-globe.gl'), { ssr: false });

interface GlobeProps {
  hotspots: HotspotData[];
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

const HOME = { lat: 25, lng: 40, altitude: 1.95 };
const MARKER_ALTITUDE = 0.012;
const MAX_PIXEL_RATIO = 1.5;
const SIZE = { low: 8, medium: 10, high: 12, critical: 15 } as const;

export default function Globe({ onEventClick }: GlobeProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const container = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<MarkerLayer | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [rotating, setRotating] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);
  const [hovered, setHovered] = useState<MapEvent | null>(null);
  const [layer, setLayer] = useState<'all' | EventCategory>('all');
  const { items: allEvents, loading, error, counts } = useEvents();
  const liveEvents = useMemo(() => layer === 'all' ? allEvents : allEvents.filter(e => e.category === layer), [allEvents, layer]);

  // Flat ocean colour until the map texture is ready; MeshBasicMaterial needs no lighting.
  const globeMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#d6e5f1' }), []);

  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: Math.floor(entry.contentRect.width), height: Math.floor(entry.contentRect.height) }));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  // Renderer setup, map texture and the marker layer, once the globe exists.
  useEffect(() => {
    const g = globeRef.current;
    if (!g || !globeReady) return;
    const renderer = g.renderer();
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    renderer.setPixelRatio(ratio);
    g.controls().autoRotateSpeed = 0.35;
    g.pointOfView(HOME);

    const width = Math.min(renderer.capabilities.maxTextureSize, (container.current?.clientWidth || 0) < 700 ? 2048 : 4096);
    let cancelled = false;
    mapTexture(width, renderer.capabilities.getMaxAnisotropy()).then(tex => {
      if (cancelled) return;
      globeMaterial.color.set('#ffffff');
      globeMaterial.map = tex;
      globeMaterial.needsUpdate = true;
    });

    const markers = layerRef.current ?? (layerRef.current = createMarkerLayer());
    markers.uniforms.uPixelRatio.value = ratio;
    g.scene().add(markers.points);

    // Stop rendering entirely while the globe is scrolled out of view.
    const visibility = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) g.resumeAnimation(); else g.pauseAnimation(); });
    if (container.current) visibility.observe(container.current);
    return () => { cancelled = true; visibility.disconnect(); markers.points.removeFromParent(); };
  }, [globeReady, globeMaterial]);

  useEffect(() => () => { layerRef.current?.dispose(); globeMaterial.dispose(); }, [globeMaterial]);

  useEffect(() => { if (globeRef.current && globeReady) globeRef.current.controls().autoRotate = rotating; }, [rotating, globeReady]);

  // Push the current events into the GPU buffers whenever they change.
  useEffect(() => {
    const g = globeRef.current, markers = layerRef.current;
    if (!g || !globeReady || !markers) return;
    setMarkers(markers, liveEvents.map(e => ({
      lat: e.lat, lng: e.lng,
      color: eventTypeConfig[e.type]?.color || '#0aa5bc',
      size: (SIZE[e.severity] ?? 8) + (e.category === 'hazard' ? 2 : 0),
      hazard: e.category === 'hazard',
      critical: e.severity === 'critical',
    })), (lat, lng) => g.getCoords(lat, lng, MARKER_ALTITUDE));
    markers.uniforms.uHover.value = -1;
  }, [liveEvents, globeReady]);

  useEffect(() => {
    const markers = layerRef.current;
    if (markers) markers.uniforms.uSelected.value = selectedEvent ? liveEvents.indexOf(selectedEvent) : -1;
  }, [selectedEvent, liveEvents]);

  // Legend: the event types currently on the map, most common first
  const legend = useMemo(() => {
    const tally: Record<string, number> = {};
    for (const e of liveEvents) tally[e.type] = (tally[e.type] || 0) + 1;
    return Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [liveEvents]);

  const pickAt = useCallback((clientX: number, clientY: number) => {
    const g = globeRef.current, markers = layerRef.current;
    if (!g || !markers) return -1;
    const rect = g.renderer().domElement.getBoundingClientRect();
    return pickMarker(markers, g.camera(), rect.width, rect.height, clientX - rect.left, clientY - rect.top);
  }, []);

  // Hover (mouse only), throttled to one hit test per frame
  const frame = useRef(0);
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.buttons) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const i = pickAt(clientX, clientY);
      const markers = layerRef.current;
      if (markers) markers.uniforms.uHover.value = i;
      if (container.current) container.current.style.cursor = i >= 0 ? 'pointer' : '';
      setHovered(i >= 0 ? liveEvents[i] : null);
      const rect = container.current?.getBoundingClientRect();
      if (tipRef.current && rect) tipRef.current.style.transform = `translate(${clientX - rect.left}px, ${clientY - rect.top}px)`;
    });
  }, [pickAt, liveEvents]);

  const onPointerLeave = useCallback(() => {
    cancelAnimationFrame(frame.current);
    if (layerRef.current) layerRef.current.uniforms.uHover.value = -1;
    setHovered(null);
  }, []);

  // Click or tap (not a drag) selects the nearest marker and flies to it
  const down = useRef({ x: 0, y: 0 });
  const onPointerDown = useCallback((e: React.PointerEvent) => { down.current = { x: e.clientX, y: e.clientY }; }, []);
  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y) > 6) return;
    if ((e.target as HTMLElement).closest('button, a, .selected-event, .event-legend')) return;
    const i = pickAt(e.clientX, e.clientY);
    if (i < 0) return;
    const ev = liveEvents[i];
    setSelectedEvent(ev);
    setHovered(null);
    onEventClick?.(ev);
    globeRef.current?.pointOfView({ lat: ev.lat, lng: ev.lng, altitude: 1.5 }, 1000);
  }, [pickAt, liveEvents, onEventClick]);

  const onZoom = useCallback((pov: { altitude: number }) => {
    // Markers grow a little as you zoom in, so dense areas separate.
    if (layerRef.current) layerRef.current.uniforms.uScale.value = Math.min(1.6, Math.max(0.85, Math.pow(HOME.altitude / pov.altitude, 0.35)));
  }, []);

  return (
    <div ref={container} className="globe-root" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      {size.width > 0 && size.height > 0 && <div className="globe-canvas"><GlobeGL
        ref={globeRef}
        width={size.width}
        height={size.height}
        backgroundColor="rgba(0,0,0,0)"
        rendererConfig={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        globeMaterial={globeMaterial}
        showGraticules={false}
        atmosphereColor="#7cc4e4"
        atmosphereAltitude={0.14}
        onZoom={onZoom}
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

      <div ref={tipRef} className={'globe-tip' + (hovered ? ' is-visible' : '')} aria-hidden="true">
        {hovered && <div style={{ '--c': eventTypeConfig[hovered.type]?.color || '#0aa5bc' } as React.CSSProperties}>
          <b>{(eventTypeConfig[hovered.type]?.label || 'Event').toLowerCase()}</b>
          <span>{hovered.title}</span>
          <small>{hovered.source}{hovered.magnitude ? ' · ' + hovered.magnitude : ''}</small>
        </div>}
      </div>

      <div className="event-legend">
        <div className="event-legend-items">
          {legend.map(([type, n]) => (
            <div key={type}>
              <i className={eventTypeConfig[type]?.category === 'hazard' ? 'is-ring' : undefined} style={{ '--c': eventTypeConfig[type]?.color || '#94a3b8' } as React.CSSProperties} />
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
          <button className="icon-button" aria-label={rotating ? 'Pause globe rotation' : 'Rotate globe'} aria-pressed={rotating} onClick={() => setRotating(!rotating)}>{rotating ? <Pause size={14} /> : <Play size={14} />}</button>
          <button className="icon-button" aria-label="Reset globe view" onClick={() => { globeRef.current?.pointOfView(HOME, 800); setSelectedEvent(null); }}><RotateCcw size={14} /></button>
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
      setTime(new Date().toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    // Minutes are all a clock face needs; ticking every second would re-render for nothing.
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <div className="world-clock"><small>{label}</small><span>{time || '—'}</span></div>
  );
}
