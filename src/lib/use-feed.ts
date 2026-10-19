'use client';
import { useCallback, useSyncExternalStore } from 'react';
import { isTabHidden } from '@/lib/shared-fetch';

interface FeedState<T> { items: T[]; loading: boolean; error: boolean; updated: Date | null }
interface FeedStore {
  state: FeedState<unknown>;
  listeners: Set<() => void>;
  controller: AbortController | null;
  timer: ReturnType<typeof setInterval> | null;
}

const INITIAL: FeedState<never> = { items: [], loading: true, error: false, updated: null };

// One store per URL, so every panel that reads the same feed shares a single
// request and a single polling timer instead of fetching it once each.
const stores = new Map<string, FeedStore>();

function getStore(url: string): FeedStore {
  let store = stores.get(url);
  if (!store) {
    store = { state: INITIAL, listeners: new Set(), controller: null, timer: null };
    stores.set(url, store);
  }
  return store;
}

function setState(store: FeedStore, patch: Partial<FeedState<unknown>>) {
  store.state = { ...store.state, ...patch };
  store.listeners.forEach(listener => listener());
}

async function load(url: string, key: string) {
  const store = getStore(url);
  store.controller?.abort();
  const controller = new AbortController();
  store.controller = controller;
  setState(store, { loading: true });
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error('Feed unavailable');
    const data = await response.json();
    if (!Array.isArray(data[key])) throw new Error('Invalid feed');
    if (controller.signal.aborted) return;
    setState(store, { items: data[key], updated: new Date(), error: false, loading: false });
  } catch {
    if (!controller.signal.aborted) setState(store, { error: true, loading: false });
  }
}

export function useFeed<T>(url: string, key: string, interval: number) {
  const subscribe = useCallback((listener: () => void) => {
    const store = getStore(url);
    store.listeners.add(listener);
    if (store.listeners.size === 1) {
      const stale = !store.state.updated || Date.now() - store.state.updated.getTime() > interval;
      if (stale) setTimeout(() => void load(url, key), 0);
      store.timer = setInterval(() => { if (!isTabHidden()) void load(url, key); }, interval);
    }
    return () => {
      store.listeners.delete(listener);
      if (store.listeners.size === 0) {
        if (store.timer) clearInterval(store.timer);
        store.timer = null;
        store.controller?.abort();
        if (store.state.loading) store.state = { ...store.state, loading: false };
      }
    };
  }, [url, key, interval]);
  const state = useSyncExternalStore(subscribe, () => getStore(url).state, () => INITIAL) as FeedState<T>;
  const refresh = useCallback(() => load(url, key), [url, key]);
  return { ...state, refresh };
}
