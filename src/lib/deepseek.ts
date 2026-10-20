// Server-side only. Calls DeepSeek's chat API and returns parsed JSON.
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

export async function deepseekJson<T>(prompt: string, apiKey: string, maxTokens = 600, timeoutMs = 45000): Promise<T> {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    signal: AbortSignal.timeout(timeoutMs),
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    console.error('DeepSeek request failed', res.status, detail.slice(0, 300));
    throw new Error('AI request failed');
  }
  const data = await res.json();
  const raw: string = data?.choices?.[0]?.message?.content ?? '{}';
  return JSON.parse(raw) as T;
}

// Fetches the same headline list the dashboard shows, so AI answers match what the page displays.
export interface Headline { title: string; source: string; link: string; pubDate: string }

export async function currentHeadlines(origin: string, max = 30): Promise<Headline[]> {
  const res = await fetch(`${origin}/api/news`, { cache: 'no-store' });
  if (!res.ok) throw new Error('News feed unavailable');
  const news = (await res.json()) as { items: Headline[] };
  return news.items.slice(0, max);
}
