'use client';
import { useEffect, useId, useRef, useState } from 'react';

// Small SVG/CSS chart primitives. No chart library: everything here is a few lines of markup.

export function CountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now();
    const base = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const p = reduce ? 1 : Math.min(1, (now - start) / 900);
      const v = Math.round(base + (value - base) * (1 - Math.pow(1 - p, 3)));
      from.current = v;
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{shown.toLocaleString()}</>;
}

export function Spark({ values, color = 'var(--accent)' }: { values: number[]; color?: string }) {
  const id = useId();
  const w = 140, h = 44;
  const max = Math.max(...values, 1);
  const step = w / Math.max(values.length - 1, 1);
  const pts = values.map((v, i) => [i * step, h - 3 - (v / max) * (h - 8)] as const);
  const line = pts.map(([x, y], i) => {
    if (!i) return `M${x.toFixed(1)} ${y.toFixed(1)}`;
    const [px, py] = pts[i - 1], mx = ((px + x) / 2).toFixed(1);
    return `C${mx} ${py.toFixed(1)} ${mx} ${y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join('');
  return <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".28" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
    <path d={`${line}L${w} ${h}L0 ${h}Z`} fill={`url(#${id})`} />
    <path d={line} fill="none" stroke={color} strokeWidth="2.25" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export function Ring({ parts, total, size = 64, stroke = 8, children }: {
  parts: { value: number; color: string }[]; total?: number; size?: number; stroke?: number; children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, mid = size / 2;
  const sum = total ?? (parts.reduce((s, p) => s + p.value, 0) || 1);
  const segs = parts.map((p, i) => ({
    ...p,
    len: (p.value / sum) * c,
    start: parts.slice(0, i).reduce((s, q) => s + (q.value / sum) * c, 0),
  }));
  return <span className="donut" style={{ width: size, height: size }}>
    <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={mid} cy={mid} r={r} fill="none" stroke="var(--track)" strokeWidth={stroke} />
      {segs.filter(s => s.len > 0).map((s, i) => <circle key={i} className="donut-seg" cx={mid} cy={mid} r={r} fill="none" stroke={s.color} strokeWidth={stroke}
        strokeDasharray={`${s.len} ${c - s.len}`} strokeDashoffset={-s.start} transform={`rotate(-90 ${mid} ${mid})`} />)}
    </svg>
    {children && <span className="donut-label">{children}</span>}
  </span>;
}

export function SegBar({ parts }: { parts: { value: number; color: string; label: string }[] }) {
  const live = parts.filter(p => p.value > 0);
  return <div className="segbar" role="img" aria-label={live.map(p => `${p.value} ${p.label}`).join(', ') || 'No data'}>
    {live.length ? live.map(p => <i key={p.label} style={{ flex: p.value, background: p.color }} title={`${p.label}: ${p.value}`} />) : <i style={{ flex: 1 }} />}
  </div>;
}

export function BarList({ rows, unit = '' }: { rows: { label: string; value: number; color?: string }[]; unit?: string }) {
  const max = Math.max(...rows.map(r => r.value), 1);
  return <ul className="bars">
    {rows.map((r, i) => <li key={r.label} style={{ '--i': i } as React.CSSProperties}>
      <span className="bar-label">{r.label}</span>
      <span className="bar-track"><i style={{ width: `${(r.value / max) * 100}%`, background: r.color }} /></span>
      <b>{r.value}{unit}</b>
    </li>)}
  </ul>;
}
