import { deepseekJson } from '@/lib/deepseek';

// Server-side headline translation into English for non-English sources.
// Translations are remembered per headline, so each new refresh only pays for headlines it hasn't seen.

export { LANGUAGE_NAMES } from '@/lib/languages';

const remembered = new Map<string, string>();
const BATCH = 40;
const MAX_BATCHES = 6;

export async function translateToEnglish(texts: string[], apiKey: string | undefined): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const todo: string[] = [];
  for (const t of new Set(texts)) {
    const hit = remembered.get(t);
    if (hit) out.set(t, hit); else todo.push(t);
  }
  if (!apiKey || !todo.length) return out;

  const batches: string[][] = [];
  for (let i = 0; i < todo.length && batches.length < MAX_BATCHES; i += BATCH) batches.push(todo.slice(i, i + BATCH));

  await Promise.all(batches.map(async batch => {
    const prompt = `Translate each numbered news headline into natural English.
Keep names, places and numbers accurate. Do not add commentary or explanations.

Return only a JSON object in this exact shape, with the same number of items in the same order:
{"translations": ["English headline 0", "English headline 1"]}

Headlines:
${batch.map((t, i) => `[${i}] ${t}`).join('\n')}`;
    try {
      const res = await deepseekJson<{ translations?: unknown[] }>(prompt, apiKey, 3000, 25000);
      batch.forEach((t, i) => {
        const v = res.translations?.[i];
        if (typeof v === 'string' && v.trim()) { remembered.set(t, v.trim()); out.set(t, v.trim()); }
      });
    } catch (err) {
      console.error('Headline translation failed', err);
    }
  }));

  if (remembered.size > 6000) remembered.clear();
  return out;
}
