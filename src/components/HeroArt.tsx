// Original illustration: a stylised globe with orbit arcs and signal nodes.
// Drawn as SVG so it stays sharp at any size and needs no image assets.
export default function HeroArt() {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label="Globe with orbit and signal nodes">
      <defs>
        <radialGradient id="globe-fill" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="55%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#0b1f57" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="78" fill="none" stroke="#c7d7f5" strokeWidth="1" strokeDasharray="3 5" />
      <circle cx="60" cy="60" r="40" fill="url(#globe-fill)" />
      <path d="M22 52 Q60 34 98 52" fill="none" stroke="#ffffff55" strokeWidth="1.2" />
      <path d="M22 68 Q60 86 98 68" fill="none" stroke="#ffffff55" strokeWidth="1.2" />
      <ellipse cx="60" cy="60" rx="18" ry="40" fill="none" stroke="#ffffff40" strokeWidth="1.2" />
      <path d="M14 78 Q60 8 106 42" fill="none" stroke="#0ea5e9" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="106" cy="42" r="4.5" fill="#0ea5e9" />
      <circle cx="104" cy="42" r="9" fill="#0ea5e922" />
      <circle cx="38" cy="44" r="3" fill="#f59e0b" />
      <circle cx="78" cy="78" r="3" fill="#ef4444" />
      <circle cx="22" cy="78" r="2.5" fill="#22c55e" />
    </svg>
  );
}
