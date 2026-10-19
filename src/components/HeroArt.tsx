// Original illustration: a wireframe globe inside a radar sweep, with signal blips.
// Drawn as SVG so it stays sharp at any size and needs no image assets.
export default function HeroArt() {
  return (
    <svg viewBox="0 0 400 400" role="img" aria-label="Wireframe globe under a radar sweep">
      <defs>
        <radialGradient id="hero-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3fe0f0" stopOpacity=".16" />
          <stop offset="70%" stopColor="#3fe0f0" stopOpacity=".03" />
          <stop offset="100%" stopColor="#3fe0f0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hero-sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3fe0f0" stopOpacity="0" />
          <stop offset="100%" stopColor="#3fe0f0" stopOpacity=".38" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="196" fill="url(#hero-glow)" />
      <g fill="none" stroke="#7d93ad" strokeOpacity=".18">
        <circle cx="200" cy="200" r="190" strokeDasharray="2 6" />
        <circle cx="200" cy="200" r="150" />
        <circle cx="200" cy="200" r="110" strokeOpacity=".28" />
        <ellipse cx="200" cy="200" rx="45" ry="110" strokeOpacity=".24" />
        <ellipse cx="200" cy="200" rx="85" ry="110" strokeOpacity=".2" />
        <ellipse cx="200" cy="200" rx="110" ry="40" strokeOpacity=".2" />
        <path d="M90 200 H310 M200 90 V310" strokeOpacity=".22" />
        <path d="M10 200 H70 M330 200 H390 M200 10 V70 M200 330 V390" strokeOpacity=".3" />
      </g>
      <g className="hero-sweep">
        <path d="M200 200 L390 200 A190 190 0 0 0 334.4 65.6 Z" fill="url(#hero-sweep)" />
        <path d="M200 200 L390 200" stroke="#a5f3fc" strokeOpacity=".7" strokeWidth="1.5" />
      </g>
      <g fill="#3fe0f0">
        <circle cx="262" cy="148" r="5" />
        <circle cx="262" cy="148" r="12" fillOpacity=".18" />
        <circle cx="150" cy="232" r="3.5" fillOpacity=".85" />
        <circle cx="228" cy="268" r="3" fillOpacity=".6" />
        <circle cx="318" cy="252" r="2.5" fillOpacity=".5" />
      </g>
      <circle cx="132" cy="150" r="3" fill="#ff4d5e" fillOpacity=".8" />
    </svg>
  );
}
