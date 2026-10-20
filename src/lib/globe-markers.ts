import * as THREE from 'three';

// All event markers in one THREE.Points object with a small shader: one draw call for every marker,
// instead of one DOM element per event that the browser re-positions every frame.
// Conflict events draw as a solid dot with a white rim, natural hazards as a ring with a core,
// critical events get a pulse, and the hovered or selected marker gets an outline.

export interface MarkerInput { lat: number; lng: number; color: string; size: number; hazard: boolean; critical: boolean }

const SPRITE = 3; // the point sprite is 3x the marker diameter, leaving room for the halo and pulse

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aKind;
  attribute float aPulse;
  attribute float aIndex;
  uniform float uPixelRatio;
  uniform float uScale;
  uniform float uHover;
  uniform float uSelected;
  varying vec3 vColor;
  varying float vKind;
  varying float vPulse;
  varying float vPx;
  varying float vPhase;
  varying float vFocus;
  varying float vFade;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    float facing = dot(normalize(world.xyz), normalize(cameraPosition - world.xyz));
    vFade = smoothstep(0.02, 0.2, facing);
    vFocus = (abs(aIndex - uHover) < 0.5 || abs(aIndex - uSelected) < 0.5) ? 1.0 : 0.0;
    vPx = aSize * uScale * (1.0 + 0.3 * vFocus) * ${SPRITE.toFixed(1)} * uPixelRatio;
    gl_PointSize = facing > 0.0 ? vPx : 0.0;
    vColor = aColor;
    vKind = aKind;
    vPulse = aPulse;
    vPhase = fract(aIndex * 0.61803);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vColor;
  varying float vKind;
  varying float vPulse;
  varying float vPx;
  varying float vPhase;
  varying float vFocus;
  varying float vFade;
  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float r = length(uv);
    float aa = 2.0 / vPx;           // about one device pixel, in sprite units
    float R = ${(1 / SPRITE).toFixed(5)};   // marker radius
    // soft halo
    vec4 col = vec4(vColor, (1.0 - smoothstep(R, R * 1.6, r)) * 0.22);
    // expanding pulse ring for critical events
    if (vPulse > 0.5) {
      float t = fract(uTime / 2.2 + vPhase);
      float ring = (1.0 - smoothstep(0.0, aa * 1.5 + 0.015, abs(r - R * (1.0 + 1.8 * t)))) * (1.0 - t) * 0.7;
      col = col.a > ring ? col : vec4(vColor, ring);
    }
    // outline for the hovered or selected marker
    if (vFocus > 0.5) {
      float ring = 1.0 - smoothstep(aa, aa * 2.0 + 0.012, abs(r - R * 1.28));
      col = mix(col, vec4(vColor, 1.0), ring);
    }
    // marker body
    float body = 1.0 - smoothstep(R - aa, R, r);
    vec3 fill;
    if (vKind < 0.5) {
      fill = mix(vec3(1.0), vColor, 1.0 - smoothstep(R * 0.68 - aa, R * 0.68, r));
    } else {
      float rim = smoothstep(R * 0.7 - aa, R * 0.7, r);
      float core = 1.0 - smoothstep(R * 0.36 - aa, R * 0.36, r);
      fill = mix(mix(vec3(1.0), vColor, 0.16), vColor, max(rim, core));
    }
    col = mix(col, vec4(fill, 1.0), body);
    col.a *= vFade;
    if (col.a < 0.01) discard;
    gl_FragColor = col;
  }
`;

export interface MarkerLayer {
  points: THREE.Points;
  uniforms: { uTime: { value: number }; uPixelRatio: { value: number }; uScale: { value: number }; uHover: { value: number }; uSelected: { value: number } };
  positions: Float32Array;
  sizes: Float32Array;
  dispose: () => void;
}

export function createMarkerLayer(): MarkerLayer {
  const uniforms = { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uScale: { value: 1 }, uHover: { value: -1 }, uSelected: { value: -1 } };
  const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, depthWrite: false, depthTest: false });
  const geometry = new THREE.BufferGeometry();
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 10;
  points.onBeforeRender = () => { uniforms.uTime.value = performance.now() / 1000; };
  return {
    points, uniforms, positions: new Float32Array(0), sizes: new Float32Array(0),
    dispose: () => { geometry.dispose(); material.dispose(); points.removeFromParent(); },
  };
}

const hex = (c: string): [number, number, number] => {
  const n = parseInt(c.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export function setMarkers(layer: MarkerLayer, markers: MarkerInput[], toXYZ: (lat: number, lng: number) => { x: number; y: number; z: number }) {
  const n = markers.length;
  const position = new Float32Array(n * 3), color = new Float32Array(n * 3);
  const size = new Float32Array(n), kind = new Float32Array(n), pulse = new Float32Array(n), index = new Float32Array(n);
  markers.forEach((m, i) => {
    const p = toXYZ(m.lat, m.lng);
    position.set([p.x, p.y, p.z], i * 3);
    color.set(hex(m.color), i * 3);
    size[i] = m.size; kind[i] = m.hazard ? 1 : 0; pulse[i] = m.critical ? 1 : 0; index[i] = i;
  });
  const g = layer.points.geometry;
  g.setAttribute('position', new THREE.BufferAttribute(position, 3));
  g.setAttribute('aColor', new THREE.BufferAttribute(color, 3));
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  g.setAttribute('aKind', new THREE.BufferAttribute(kind, 1));
  g.setAttribute('aPulse', new THREE.BufferAttribute(pulse, 1));
  g.setAttribute('aIndex', new THREE.BufferAttribute(index, 1));
  layer.positions = position;
  layer.sizes = size;
}

// Screen-space hit test against the camera: cheap for a few hundred markers, and it skips the far side.
export function pickMarker(layer: MarkerLayer, camera: THREE.Camera, width: number, height: number, x: number, y: number): number {
  const v = new THREE.Vector3();
  const cam = camera.position;
  const { positions, sizes } = layer;
  let best = -1, bestDist = Infinity;
  for (let i = 0; i < sizes.length; i++) {
    const px = positions[i * 3], py = positions[i * 3 + 1], pz = positions[i * 3 + 2];
    if (px * (cam.x - px) + py * (cam.y - py) + pz * (cam.z - pz) <= 0) continue;
    v.set(px, py, pz).project(camera);
    const d = Math.hypot((v.x + 1) / 2 * width - x, (1 - v.y) / 2 * height - y);
    const reach = (sizes[i] * layer.uniforms.uScale.value) / 2 + 6;
    if (d < reach && d < bestDist) { best = i; bestDist = d; }
  }
  return best;
}
