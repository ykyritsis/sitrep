import { NextResponse } from 'next/server';

// Natural hazards from three free, key-less public sources:
//  - USGS: earthquakes M4.5+ over the last week
//  - GDACS (UN/EU): tropical cyclones, floods, volcanoes and droughts with alert levels
//  - NASA EONET: active wildfires, largest first
// Each source is fetched independently, so one outage only removes its own events.

type Severity = 'low' | 'medium' | 'high' | 'critical';

interface Hazard {
  id: string;
  category: 'hazard';
  type: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  timestamp: string;
  severity: Severity;
  source: string;
  sourceUrl: string;
  region?: string;
  magnitude?: string;
}

// A fresh timeout signal per request: a shared one would expire for good 15 seconds after the server starts.
const upstream = () => ({ next: { revalidate: 600 }, signal: AbortSignal.timeout(15000) });
const ago = (ms: number) => new Date(ms).toISOString();

async function earthquakes(): Promise<Hazard[]> {
  const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson', upstream());
  if (!res.ok) throw new Error('USGS ' + res.status);
  const data = await res.json();
  return data.features.map((f: { id: string; geometry: { coordinates: number[] }; properties: { mag: number; place: string; time: number; url: string } }) => {
    const mag: number = f.properties.mag;
    const place = (f.properties.place || 'Unknown location').replace(/^\d+\s?km\s\w+\s+of\s+/i, '');
    return {
      id: 'usgs-' + f.id,
      category: 'hazard' as const,
      type: 'quake',
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      title: `M${mag.toFixed(1)} earthquake, ${place}`,
      description: `Magnitude ${mag.toFixed(1)} earthquake near ${f.properties.place}, depth ${Math.round(f.geometry.coordinates[2])} km.`,
      timestamp: ago(f.properties.time),
      severity: mag >= 7 ? 'critical' : mag >= 6 ? 'high' : mag >= 5 ? 'medium' : 'low',
      source: 'USGS',
      sourceUrl: f.properties.url,
      region: place,
      magnitude: 'M' + mag.toFixed(1),
    };
  });
}

const GDACS_TYPES: Record<string, string> = { TC: 'storm', FL: 'flood', VO: 'volcano', DR: 'drought' };
const GDACS_SEVERITY: Record<string, Severity> = { Red: 'critical', Orange: 'high', Green: 'low' };

async function gdacs(): Promise<Hazard[]> {
  const res = await fetch('https://www.gdacs.org/gdacsapi/api/events/geteventlist/EVENTS4APP', upstream());
  if (!res.ok) throw new Error('GDACS ' + res.status);
  const data = await res.json();
  return data.features
    .filter((f: { properties: { eventtype: string; iscurrent: string } }) => GDACS_TYPES[f.properties.eventtype] && f.properties.iscurrent !== 'false')
    .map((f: { properties: { eventtype: string; eventid: number; name: string; description: string; htmldescription: string; alertlevel: string; country?: string; fromdate: string; url: { report: string } }; geometry: { coordinates: number[] } }) => ({
      id: `gdacs-${f.properties.eventtype}-${f.properties.eventid}`,
      category: 'hazard' as const,
      type: GDACS_TYPES[f.properties.eventtype],
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      title: f.properties.name,
      description: f.properties.htmldescription || f.properties.description,
      timestamp: new Date(f.properties.fromdate + 'Z').toISOString(),
      severity: GDACS_SEVERITY[f.properties.alertlevel] || 'low',
      source: 'GDACS',
      sourceUrl: f.properties.url.report,
      region: f.properties.country,
      magnitude: f.properties.alertlevel + ' alert',
    }));
}

async function wildfires(): Promise<Hazard[]> {
  const res = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&category=wildfires&limit=100', upstream());
  if (!res.ok) throw new Error('EONET ' + res.status);
  const data = await res.json();
  type Geometry = { date: string; coordinates: number[]; magnitudeValue?: number; magnitudeUnit?: string };
  return data.events
    .map((e: { id: string; title: string; link: string; geometry: Geometry[] }) => {
      const latest = e.geometry[e.geometry.length - 1];
      const size = latest?.magnitudeValue ?? 0;
      return { e, latest, size };
    })
    .filter((x: { latest?: Geometry }) => x.latest && x.latest.coordinates.length === 2)
    .sort((a: { size: number }, b: { size: number }) => b.size - a.size)
    .slice(0, 30)
    .map(({ e, latest, size }: { e: { id: string; title: string; link: string }; latest: Geometry; size: number }): Hazard => ({
      id: 'eonet-' + e.id,
      category: 'hazard',
      type: 'wildfire',
      lat: latest.coordinates[1],
      lng: latest.coordinates[0],
      title: e.title,
      description: size ? `Active wildfire covering about ${Math.round(size).toLocaleString()} ${latest.magnitudeUnit || 'acres'}.` : 'Active wildfire reported by NASA EONET.',
      timestamp: latest.date,
      severity: size > 50000 ? 'high' : size > 10000 ? 'medium' : 'low',
      source: 'NASA EONET',
      sourceUrl: e.link,
      magnitude: size ? `${Math.round(size).toLocaleString()} ${latest.magnitudeUnit || 'acres'}` : undefined,
    }));
}

export async function GET() {
  const results = await Promise.allSettled([earthquakes(), gdacs(), wildfires()]);
  const events = results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
  if (!events.length) return NextResponse.json({ events: [], error: 'Hazard sources unavailable' }, { status: 502 });
  const rank = { critical: 0, high: 1, medium: 2, low: 3 };
  events.sort((a, b) => rank[a.severity] - rank[b.severity] || new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return NextResponse.json(
    { events, count: events.length, sources: results.map(r => r.status === 'fulfilled') },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900' } },
  );
}
