'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Banknote, BarChart3, Fuel } from 'lucide-react';

interface MarketData {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export default function FinancialIndicators() {
  const [markets, setMarkets] = useState<MarketData[]>([
    { symbol: 'SPY', name: 'S&P 500', value: 5890.23, change: 12.45, changePercent: 0.21 },
    { symbol: 'DXY', name: 'USD Index', value: 108.42, change: -0.23, changePercent: -0.21 },
    { symbol: 'GC', name: 'Gold', value: 2658.30, change: 8.50, changePercent: 0.32 },
    { symbol: 'CL', name: 'Oil (WTI)', value: 73.45, change: -1.23, changePercent: -1.65 },
    { symbol: 'BTC', name: 'Bitcoin', value: 94250, change: 1250, changePercent: 1.34 },
  ]);

  const [fedData, setFedData] = useState({
    rate: 4.50,
    balance: 6.89, // Trillions
    lastAction: 'HOLD',
    nextMeeting: '2026-01-29',
  });

  const [vix, setVix] = useState(18.45);

  useEffect(() => {
    // Simulate real-time updates with small random changes
    const interval = setInterval(() => {
      setMarkets(prev => prev.map(m => {
        const randomChange = (Math.random() - 0.5) * 0.1;
        const newChange = m.change + randomChange;
        const newValue = m.value * (1 + randomChange / 100);
        return {
          ...m,
          value: Number(newValue.toFixed(2)),
          change: Number(newChange.toFixed(2)),
          changePercent: Number((newChange / m.value * 100).toFixed(2)),
        };
      }));
      
      setVix(prev => {
        const change = (Math.random() - 0.5) * 0.5;
        return Number((prev + change).toFixed(2));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getVixLevel = () => {
    if (vix >= 30) return { color: 'text-red-400', bg: 'bg-red-500/20', label: 'EXTREME FEAR' };
    if (vix >= 20) return { color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'ELEVATED' };
    if (vix >= 15) return { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'NORMAL' };
    return { color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'LOW' };
  };

  const vixLevel = getVixLevel();

  return (
    <div className="p-3 bg-slate-900/80 border-b border-slate-700/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] text-slate-400 font-bold tracking-widest">FINANCIAL INTEL</span>
        </div>
        <span className="text-[8px] text-slate-500">SIMULATED</span>
      </div>

      {/* VIX Fear Gauge */}
      <div className={`flex items-center justify-between p-2 rounded mb-3 ${vixLevel.bg}`}>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-400">VIX</span>
          <span className={`text-sm font-bold ${vixLevel.color}`}>{vix.toFixed(2)}</span>
        </div>
        <span className={`text-[9px] font-bold ${vixLevel.color}`}>{vixLevel.label}</span>
      </div>

      {/* Market Tickers */}
      <div className="space-y-1.5 mb-3">
        {markets.map((market) => (
          <div key={market.symbol} className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-2">
              {market.symbol === 'GC' && <DollarSign className="w-3 h-3 text-yellow-400" />}
              {market.symbol === 'CL' && <Fuel className="w-3 h-3 text-slate-400" />}
              {market.symbol === 'BTC' && <Banknote className="w-3 h-3 text-orange-400" />}
              {(market.symbol === 'SPY' || market.symbol === 'DXY') && (
                market.change >= 0 
                  ? <TrendingUp className="w-3 h-3 text-emerald-400" />
                  : <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              <span className="text-slate-400">{market.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-mono">
                {market.symbol === 'BTC' ? market.value.toLocaleString() : market.value.toFixed(2)}
              </span>
              <span className={`font-mono ${market.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {market.change >= 0 ? '+' : ''}{market.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Fed Status */}
      <div className="bg-slate-800/50 rounded p-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] text-slate-400 font-bold">FEDERAL RESERVE</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
            fedData.lastAction === 'CUT' ? 'bg-emerald-500/20 text-emerald-400' :
            fedData.lastAction === 'HIKE' ? 'bg-red-500/20 text-red-400' :
            'bg-slate-700 text-slate-400'
          }`}>
            {fedData.lastAction}
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-500">Fed Funds Rate</span>
          <span className="text-blue-400 font-bold">{fedData.rate.toFixed(2)}%</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-500">Balance Sheet</span>
          <span className="text-amber-400 font-bold">${fedData.balance}T</span>
        </div>
        <div className="flex items-center justify-between text-[10px] mt-1">
          <span className="text-slate-500">Next FOMC</span>
          <span className="text-slate-300">{fedData.nextMeeting}</span>
        </div>
      </div>
    </div>
  );
}
