'use client';

// One browser-side cache for JSON requests. Components that ask for the same URL
// share a single in-flight request and reuse the result for `ttlMs`.
type Entry = { data?: unknown; at: number; inflight?: Promise<unknown> };
const cache = new Map<string, Entry>();

export function sharedJson<T>(url: string, ttlMs: number): Promise<T> {
  const entry = cache.get(url);
  if (entry?.data !== undefined && Date.now() - entry.at < ttlMs) {
    return Promise.resolve(entry.data as T);
  }
  if (entry?.inflight) return entry.inflight as Promise<T>;

  const inflight = fetch(url)
    .then(async (res) => {
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      cache.set(url, { data, at: Date.now() });
      return data as T;
    })
    .catch((err) => {
      cache.delete(url);
      throw err;
    });

  cache.set(url, { ...entry, inflight, at: entry?.at ?? 0 });
  return inflight;
}

// True when the tab is hidden, so timers can skip work nobody can see.
export function isTabHidden(): boolean {
  return typeof document !== 'undefined' && document.visibilityState === 'hidden';
}
