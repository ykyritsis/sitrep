'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isTabHidden } from '@/lib/shared-fetch';

export function useFeed<T>(url: string, key: string, interval: number) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updated, setUpdated] = useState<Date | null>(null);
  const request = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error('Feed unavailable');
      const data = await response.json();
      if (!Array.isArray(data[key])) throw new Error('Invalid feed');
      if (controller.signal.aborted) return;
      setItems(data[key]);
      setUpdated(new Date());
      setError(false);
    } catch {
      if (!controller.signal.aborted) setError(true);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [url, key]);
  useEffect(() => {
    const initial = setTimeout(() => void refresh(), 0);
    const timer = setInterval(() => { if (!isTabHidden()) void refresh(); }, interval);
    return () => { clearTimeout(initial); clearInterval(timer); request.current?.abort(); };
  }, [refresh, interval]);
  return { items, loading, error, updated, refresh };
}

