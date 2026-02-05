'use client';

import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

interface ThreatLevel {
  level: 1 | 2 | 3 | 4 | 5;
  status: string;
  color: string;
  bgColor: string;
  description: string;
}

// Based on US Homeland Security Advisory System / NTAS style
const THREAT_LEVELS: Record<number, ThreatLevel> = {
  1: { level: 1, status: 'SEVERE', color: '#ef4444', bgColor: 'bg-red-600', description: 'Severe threat of conflict' },
  2: { level: 2, status: 'HIGH', color: '#f97316', bgColor: 'bg-orange-500', description: 'High threat level' },
  3: { level: 3, status: 'ELEVATED', color: '#eab308', bgColor: 'bg-yellow-500', description: 'Elevated threat level' },
  4: { level: 4, status: 'GUARDED', color: '#3b82f6', bgColor: 'bg-blue-500', description: 'General risk' },
  5: { level: 5, status: 'LOW', color: '#22c55e', bgColor: 'bg-emerald-500', description: 'Low threat level' },
};

export default function DefconIndicator() {
  const [defconLevel, setDefconLevel] = useState<number>(4);
  const [criticalCount, setCriticalCount] = useState(0);

  useEffect(() => {
    const calculateDefcon = async () => {
      try {
        const response = await fetch('/api/news');
        const data = await response.json();
        const items = data.items || [];
        
        // Count critical and high severity items
        const critical = items.filter((item: any) => item.severity === 'critical').length;
        const high = items.filter((item: any) => item.severity === 'high').length;
        
        setCriticalCount(critical);
        
        // Calculate DEFCON based on news severity
        // This is a simplified simulation
        let level = 5;
        if (critical >= 10 || high >= 30) level = 2;
        else if (critical >= 5 || high >= 20) level = 3;
        else if (critical >= 2 || high >= 10) level = 4;
        else if (critical >= 1 || high >= 5) level = 4;
        
        setDefconLevel(level);
      } catch (error) {
        console.error('Failed to calculate DEFCON:', error);
      }
    };

    calculateDefcon();
    const interval = setInterval(calculateDefcon, 60000);
    return () => clearInterval(interval);
  }, []);

  const current = THREAT_LEVELS[defconLevel];

  return (
    <div className="p-3 bg-slate-900/80 border-b border-slate-700/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" style={{ color: current.color }} />
          <span className="text-[10px] text-slate-400 font-bold tracking-widest">THREAT ADVISORY</span>
        </div>
        <span className="text-[8px] text-slate-500">UNCLASSIFIED</span>
      </div>
      
      {/* Threat Level Display */}
      <div className="flex items-center gap-3">
        <div 
          className={`w-14 h-10 rounded flex items-center justify-center font-bold text-sm ${current.bgColor}`}
          style={{ color: '#fff' }}
        >
          {current.status}
        </div>
        <div className="flex-1">
          <div className="text-[10px] text-slate-300 font-medium">
            Current Assessment
          </div>
          <div className="text-[9px] text-slate-500">
            {current.description}
          </div>
        </div>
      </div>
      
      {/* Level Indicators */}
      <div className="flex gap-0.5 mt-3">
        {[5, 4, 3, 2, 1].map((level) => (
          <div
            key={level}
            className={`flex-1 h-1 transition-all ${
              level >= defconLevel 
                ? THREAT_LEVELS[level].bgColor 
                : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1 text-[7px] text-slate-600">
        <span>LOW</span>
        <span>SEVERE</span>
      </div>
    </div>
  );
}
