'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Clock, Activity, Globe2, TrendingUp, AlertTriangle, Zap } from 'lucide-react';

interface StatusBarProps {
  activeRegions: number;
  uplink: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
}

interface Stats {
  eventsLastHour: number;
  eventsLast24h: number;
  criticalCount: number;
  topRegion: string;
}

export default function StatusBar({ activeRegions, uplink }: StatusBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState<Stats>({ eventsLastHour: 0, eventsLast24h: 0, criticalCount: 0, topRegion: 'Loading...' });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/news');
        const data = await response.json();
        const items = data.items || [];
        
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 3600000);
        const oneDayAgo = new Date(now.getTime() - 86400000);
        
        const eventsLastHour = items.filter((item: any) => new Date(item.pubDate) > oneHourAgo).length;
        const eventsLast24h = items.filter((item: any) => new Date(item.pubDate) > oneDayAgo).length;
        const criticalCount = items.filter((item: any) => item.severity === 'critical').length;
        
        // Find most mentioned region
        const regionCounts: Record<string, number> = {};
        items.forEach((item: any) => {
          if (item.country) {
            regionCounts[item.country] = (regionCounts[item.country] || 0) + 1;
          }
        });
        const topRegion = Object.entries(regionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Global';
        
        setStats({ eventsLastHour, eventsLast24h, criticalCount, topRegion });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  };

  const uplinkConfig = {
    ONLINE: { color: '#86efac', bg: 'rgba(34, 197, 94, 0.15)' },
    DEGRADED: { color: '#fde047', bg: 'rgba(234, 179, 8, 0.15)' },
    OFFLINE: { color: '#fca5a5', bg: 'rgba(239, 68, 68, 0.15)' },
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Globe2 className="w-4 h-4 text-blue-500" />
        <span className="text-slate-200 font-bold tracking-wide text-xs">SITREP</span>
      </div>

      {/* Live Stats - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-4">
        {/* Events Last Hour */}
        <div className="flex items-center gap-1.5 text-[10px]">
          <Zap className="w-3 h-3 text-amber-400" />
          <span className="text-slate-400">1H:</span>
          <span className="text-amber-400 font-bold">{stats.eventsLastHour}</span>
        </div>
        
        {/* Events Last 24h */}
        <div className="flex items-center gap-1.5 text-[10px]">
          <TrendingUp className="w-3 h-3 text-blue-400" />
          <span className="text-slate-400">24H:</span>
          <span className="text-blue-400 font-bold">{stats.eventsLast24h}</span>
        </div>
        
        {/* Critical Count */}
        {stats.criticalCount > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] bg-red-500/10 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span className="text-red-400 font-bold">{stats.criticalCount} CRITICAL</span>
          </div>
        )}
        
        {/* Top Region */}
        <div className="flex items-center gap-1.5 text-[10px]">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span className="text-slate-400">HOT:</span>
          <span className="text-emerald-400 font-bold">{stats.topRegion}</span>
        </div>
      </div>

      {/* Status Items */}
      <div className="flex items-center gap-2">
        {/* Uplink Status */}
        <div 
          className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px]"
          style={{ backgroundColor: uplinkConfig[uplink].bg }}
        >
          {uplink === 'ONLINE' ? (
            <Wifi className="w-3 h-3" style={{ color: uplinkConfig[uplink].color }} />
          ) : (
            <WifiOff className="w-3 h-3" style={{ color: uplinkConfig[uplink].color }} />
          )}
          <span 
            className="font-bold"
            style={{ color: uplinkConfig[uplink].color }}
          >
            {uplink}
          </span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded">
          <Clock className="w-3 h-3 text-slate-500" />
          <span className="text-slate-300 font-mono text-[10px]">{formatTime(currentTime)}</span>
        </div>
      </div>
    </div>
  );
}
