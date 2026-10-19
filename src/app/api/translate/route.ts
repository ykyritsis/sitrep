import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { deepseekJson } from '@/lib/deepseek';
import { allowRequest, clientIp } from '@/lib/rate-limit';

const MAX_BATCH = 10;
const MAX_TEXT = 300;
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT_PER_WINDOW = 20;
const LANGUAGES: Record<string, string> = { el: 'Greek', en: 'English' };

async function translateBatch(texts: string[], language: string, apiKey: string): Promise<string[]> {
  const list = texts.map((t, i) => `[${i}] ${t}`).join('\n');
  const prompt = `Translate each numbered news headline into ${language}.
Keep names, places and numbers accurate. Do not add commentary.

Return only a JSON object in this exact shape, with the same number of items in the same order:
{"translations": ["translated text 0", "translated text 1"]}

Headlines:
${list}`;

  const parsed = await deepseekJson<{ translations?: string[] }>(prompt, apiKey, 900);
  const out = Array.isArray(parsed.translations) ? parsed.translations : [];
  // If the model returns the wrong count, fall back to the original text rather than misaligning.
  return texts.map((t, i) => (typeof out[i] === 'string' && out[i].trim() ? out[i] : t));
}

// Translations are stable, so they are cached for a day per batch.
const cachedTranslate = unstable_cache(
  (texts: string[], language: string, apiKey: string) => translateBatch(texts, language, apiKey),
  ['translate-headlines'],
  { revalidate: 24 * 60 * 60 }
);

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Translation is not configured yet.' }, { status: 503 });

  if (!allowRequest(`translate:${clientIp(request)}`, LIMIT_PER_WINDOW, WINDOW_MS)) {
    return NextResponse.json({ error: 'Too many translation requests. Try again in a few minutes.' }, { status: 429 });
  }

  let texts: string[] = [];
  let to = 'el';
  try {
    const body = await request.json();
    texts = Array.isArray(body?.texts) ? body.texts.map((t: unknown) => String(t).slice(0, MAX_TEXT)) : [];
    to = String(body?.to || 'el');
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (texts.length === 0 || texts.length > MAX_BATCH) {
    return NextResponse.json({ error: `Send between 1 and ${MAX_BATCH} headlines.` }, { status: 400 });
  }
  const language = LANGUAGES[to];
  if (!language) return NextResponse.json({ error: 'Unsupported language.' }, { status: 400 });

  try {
    const translations = await cachedTranslate(texts, language, apiKey);
    return NextResponse.json({ translations, to });
  } catch (err) {
    console.error('Translate error', err);
    return NextResponse.json({ error: 'Translation failed. Try again later.' }, { status: 502 });
  }
}
