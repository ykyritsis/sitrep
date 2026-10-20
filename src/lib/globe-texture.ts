import * as THREE from 'three';

// Draws the whole map (ocean, land, borders, graticule, a few labels) once into an equirectangular canvas
// and uses it as the globe's texture. This replaces ~180 extruded country meshes and their border lines
// (hundreds of draw calls every frame) with a single textured sphere.

const COUNTRIES_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';

const OCEAN = '#d6e5f1';
const LAND = '#fbfcfd';
const BORDER = 'rgba(100, 116, 139, 0.55)';
const GRID = 'rgba(100, 116, 139, 0.10)';
const LABEL = 'rgba(51, 65, 85, 0.5)';

const LABELS: [string, number, number][] = [
  ['UKRAINE', 48.5, 31], ['RUSSIA', 61, 98], ['IRAN', 32.5, 54], ['ISRAEL', 31.3, 34.6], ['CHINA', 35, 103],
  ['TAIWAN', 23.6, 121], ['N. KOREA', 40.3, 127.3], ['YEMEN', 15.6, 47.5], ['SYRIA', 35, 38.5], ['SUDAN', 15.5, 30],
  ['INDIA', 22, 79], ['BRAZIL', -10, -53], ['USA', 39, -98], ['CANADA', 58, -105], ['AUSTRALIA', -25, 134],
];

type Ring = number[][];
interface Feature { geometry: { type: string; coordinates: Ring[] | Ring[][] } | null }

let geojson: Promise<Feature[]> | null = null;
const textures = new Map<number, Promise<THREE.CanvasTexture>>();

function countries(): Promise<Feature[]> {
  geojson ??= fetch(COUNTRIES_URL).then(r => r.json()).then(d => d.features as Feature[]).catch(() => { geojson = null; return []; });
  return geojson;
}

function draw(features: Feature[], width: number): HTMLCanvasElement {
  const height = width / 2;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const k = width / 4096;
  const px = (lng: number) => ((lng + 180) / 360) * width;
  const py = (lat: number) => ((90 - lat) / 180) * height;

  ctx.fillStyle = OCEAN;
  ctx.fillRect(0, 0, width, height);

  // Faint graticule every 30 degrees
  ctx.strokeStyle = GRID;
  ctx.lineWidth = 1.5 * k;
  for (let lng = -180; lng <= 180; lng += 30) { ctx.beginPath(); ctx.moveTo(px(lng), 0); ctx.lineTo(px(lng), height); ctx.stroke(); }
  for (let lat = -60; lat <= 60; lat += 30) { ctx.beginPath(); ctx.moveTo(0, py(lat)); ctx.lineTo(width, py(lat)); ctx.stroke(); }

  // Rings are unwrapped across the antimeridian and drawn at -width/0/+width, so nothing smears across the map.
  const tracePolygon = (rings: Ring[], offset: number) => {
    for (const ring of rings) {
      let prev = NaN, shift = 0;
      ring.forEach(([lng, lat], i) => {
        let x = px(lng);
        if (!Number.isNaN(prev) && Math.abs(x - prev) > width / 2) shift += x < prev ? width : -width;
        prev = x;
        x += shift + offset;
        if (i === 0) ctx.moveTo(x, py(lat)); else ctx.lineTo(x, py(lat));
      });
      ctx.closePath();
    }
  };
  ctx.fillStyle = LAND;
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1.6 * k;
  ctx.lineJoin = 'round';
  for (const f of features) {
    if (!f.geometry) continue;
    const polygons = f.geometry.type === 'Polygon' ? [f.geometry.coordinates as Ring[]] : (f.geometry.coordinates as Ring[][]);
    // Only the few shapes that touch the antimeridian need the wrapped copies.
    const wraps = polygons.some(rings => rings.some(ring => ring.some(([lng], i) => Math.abs(lng) > 179 || (i > 0 && Math.abs(lng - ring[i - 1][0]) > 180))));
    for (const offset of wraps ? [-width, 0, width] : [0]) {
      ctx.beginPath();
      for (const rings of polygons) tracePolygon(rings, offset);
      ctx.fill('evenodd');
      ctx.stroke();
    }
  }

  // Labels, stretched horizontally by 1/cos(lat) so they read evenly once wrapped onto the sphere
  ctx.fillStyle = LABEL;
  ctx.font = `600 ${Math.round(17 * k)}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const [name, lat, lng] of LABELS) {
    ctx.save();
    ctx.translate(px(lng), py(lat));
    ctx.scale(1 / Math.cos((lat * Math.PI) / 180), 1);
    ctx.fillText(name.split('').join(String.fromCharCode(8202)), 0, 0);
    ctx.restore();
  }
  return canvas;
}

// One texture per resolution, shared by every globe instance and kept across view switches.
export function mapTexture(width: number, anisotropy: number): Promise<THREE.CanvasTexture> {
  let t = textures.get(width);
  if (!t) {
    t = countries().then(features => {
      const tex = new THREE.CanvasTexture(draw(features, width));
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = anisotropy;
      return tex;
    });
    textures.set(width, t);
  }
  return t;
}
