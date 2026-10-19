'use client';
import { useMemo } from 'react';
import { useFeed } from '@/lib/use-feed';
import { categoryOf, type EventCategory } from '@/lib/event-types';

export interface MapEvent {
  id: string;
  type: string;
  category: EventCategory;
  lat: number;
  lng: number;
  title: string;
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  sourceUrl?: string;
  region?: string;
  magnitude?: string;
}

// Reported conflict events and natural hazards, merged into one list for the globe and the charts.
// Each feed is shared and polled once, wherever it is used, and one failing feed does not hide the other.
export function useEvents() {
  const conflict = useFeed<Omit<MapEvent, 'category'>>('/api/events', 'events', 120000);
  const hazards = useFeed<Omit<MapEvent, 'category'>>('/api/hazards', 'events', 600000);
  const items = useMemo<MapEvent[]>(() => [
    ...conflict.items.map(e => ({ ...e, category: 'conflict' as const })),
    ...hazards.items.map(e => ({ ...e, category: categoryOf(e.type) })),
  ], [conflict.items, hazards.items]);
  const updated = conflict.updated && hazards.updated ? (conflict.updated > hazards.updated ? conflict.updated : hazards.updated) : conflict.updated ?? hazards.updated;
  return {
    items,
    loading: conflict.loading && hazards.loading,
    error: conflict.error && hazards.error,
    updated,
    counts: { conflict: conflict.items.length, hazard: hazards.items.length },
  };
}
