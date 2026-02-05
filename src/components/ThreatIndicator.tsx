'use client';

import { ThreatLevel } from '@/types';
import { Shield } from 'lucide-react';

interface ThreatIndicatorProps {
  level: ThreatLevel;
}

const threatConfig: Record<ThreatLevel, { color: string; bg: string; description: string }> = {
  LOW: { color: '#86efac', bg: 'rgba(34, 197, 94, 0.15)', description: 'Normal operations' },
  GUARDED: { color: '#93c5fd', bg: 'rgba(59, 130, 246, 0.15)', description: 'General risk awareness' },
  ELEVATED: { color: '#fde047', bg: 'rgba(234, 179, 8, 0.15)', description: 'Significant risk' },
  HIGH: { color: '#fdba74', bg: 'rgba(249, 115, 22, 0.15)', description: 'High risk of incident' },
  SEVERE: { color: '#fca5a5', bg: 'rgba(239, 68, 68, 0.15)', description: 'Severe risk - imminent threat' },
};

export default function ThreatIndicator({ level }: ThreatIndicatorProps) {
  const config = threatConfig[level];

  return (
    <div className="bg-slate-900 p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-5 h-5 text-slate-400" />
        <span className="text-xs text-slate-400 tracking-wider font-medium">THREAT LEVEL</span>
      </div>

      {/* Level Display */}
      <div 
        className="text-3xl font-bold tracking-wider mb-2"
        style={{ color: config.color }}
      >
        {level}
      </div>
      <div className="text-sm text-slate-300">{config.description}</div>
      
      {/* Level Bar */}
      <div className="mt-4 flex gap-1.5">
        {(['LOW', 'GUARDED', 'ELEVATED', 'HIGH', 'SEVERE'] as ThreatLevel[]).map((l, i) => {
          const isActive = ['LOW', 'GUARDED', 'ELEVATED', 'HIGH', 'SEVERE'].indexOf(level) >= i;
          return (
            <div
              key={l}
              className="h-2.5 flex-1 rounded transition-all"
              style={{
                backgroundColor: isActive ? threatConfig[l].color : '#334155',
                opacity: isActive ? 1 : 0.3,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
