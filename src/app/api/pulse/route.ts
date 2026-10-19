import { NextResponse } from 'next/server';

// Market pulse: a handful of currencies and crypto, with a short price history for each sparkline.
//  - Frankfurter (ECB reference rates): USD against EUR, CNY, JPY, TRY, ILS, daily for ~30 days
//  - CoinGecko: Bitcoin, with a 7-day price series
// Both are free and need no key.

interface Tile { id: string; label: string; value: number; change: number; period: string; series: number[]; unit: string; decimals: number }

// A fresh timeout signal per request: a shared one would expire for good 15 seconds after the server starts.
const upstream = () => ({ next: { revalidate: 900 }, signal: AbortSignal.timeout(15000) });
const CURRENCIES = ['EUR', 'CNY', 'JPY', 'TRY', 'ILS'];

async function currencies(): Promise<Tile[]> {
  const start = new Date(Date.now() - 32 * 86400e3).toISOString().slice(0, 10);
  const res = await fetch(`https://api.frankfurter.dev/v1/${start}..?base=USD&symbols=${CURRENCIES.join(',')}`, upstream());
  if (!res.ok) throw new Error('Frankfurter ' + res.status);
  const data = await res.json();
  const days = Object.keys(data.rates).sort();
  return CURRENCIES.map(code => {
    const series = days.map(d => data.rates[d][code]).filter((v: unknown) => typeof v === 'number') as number[];
    const value = series[series.length - 1];
    const first = series[0];
    return { id: code, label: `USD / ${code}`, value, change: first ? ((value - first) / first) * 100 : 0, period: '30d', series, unit: '', decimals: value > 20 ? 2 : 4 };
  });
}

async function crypto(): Promise<Tile[]> {
  const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin&sparkline=true&price_change_percentage=24h', upstream());
  if (!res.ok) throw new Error('CoinGecko ' + res.status);
  const data = await res.json();
  return data.map((c: { id: string; symbol: string; current_price: number; price_change_percentage_24h: number; sparkline_in_7d?: { price: number[] } }) => ({
    id: c.id,
    label: c.symbol.toUpperCase() + ' / USD',
    value: c.current_price,
    change: c.price_change_percentage_24h ?? 0,
    series: (c.sparkline_in_7d?.price || []).filter((_, i) => i % 4 === 0),
    period: '24h',
    unit: '$',
    decimals: 0,
  }));
}

export async function GET() {
  const results = await Promise.allSettled([currencies(), crypto()]);
  const tiles = results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
  if (!tiles.length) return NextResponse.json({ tiles: [], error: 'Market data unavailable' }, { status: 502 });
  // Crypto first so the strip leads with the fastest-moving numbers.
  const order = ['bitcoin', 'EUR', 'CNY', 'JPY', 'TRY', 'ILS'];
  tiles.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  return NextResponse.json({ tiles }, { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800' } });
}
