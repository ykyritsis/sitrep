'use client';

import { HotspotData } from '@/types';
import { MapPin } from 'lucide-react';

interface HotspotTableProps {
  hotspots: HotspotData[];
  onSelect?: (hotspot: HotspotData) => void;
}

const severityConfig: Record<string, { color: string; bg: string }> = {
  low: { color: '#86efac', bg: 'rgba(34, 197, 94, 0.15)' },
  medium: { color: '#fde047', bg: 'rgba(234, 179, 8, 0.15)' },
  high: { color: '#fdba74', bg: 'rgba(249, 115, 22, 0.15)' },
  critical: { color: '#fca5a5', bg: 'rgba(239, 68, 68, 0.15)' },
};

const typeIcons: Record<string, string> = {
  conflict: '⚔️',
  breaking: '🔴',
  nuclear: '☢️',
  economic: '💰',
  cyber: '🔒',
};

export default function HotspotTable({ hotspots, onSelect }: HotspotTableProps) {
  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="card-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-orange-400" />
          <span className="text-slate-100 text-sm font-bold tracking-wide">HOTSPOTS</span>
        </div>
        <span className="text-xs text-slate-400">{hotspots.length} regions</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-slate-800">
            <tr className="text-left text-slate-400 text-xs">
              <th className="px-4 py-3 font-medium">REGION</th>
              <th className="px-4 py-3 font-medium">TYPE</th>
              <th className="px-4 py-3 font-medium">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {hotspots.map((hotspot) => (
              <tr
                key={hotspot.id}
                onClick={() => onSelect?.(hotspot)}
                className="border-t border-slate-700/50 hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full animate-pulse-dot"
                      style={{ backgroundColor: severityConfig[hotspot.severity]?.color }}
                    />
                    <span className="text-slate-100 text-sm font-medium">{hotspot.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-slate-300 text-sm">
                    {typeIcons[hotspot.type]} {hotspot.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="badge text-xs"
                    style={{ 
                      backgroundColor: severityConfig[hotspot.severity]?.bg,
                      color: severityConfig[hotspot.severity]?.color
                    }}
                  >
                    {hotspot.severity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
