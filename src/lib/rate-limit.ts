// Server-side only. A simple fixed-window limit per visitor IP.
// Each serverless instance keeps its own counts, so this is a basic brake on abuse,
// not a hard global quota. Enough to stop one visitor running up the API bill.
const windows = new Map<string, { count: number; resetAt: number }>();

export function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  return (fwd?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown').trim();
}

export function allowRequest(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = windows.get(key);
  if (!entry || now > entry.resetAt) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}
