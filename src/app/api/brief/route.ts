import { NextResponse } from 'next/server';

// Server-side only. The key is read from the environment and never sent to the browser.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const BRIEF_TTL = 30 * 60 * 1000; // regenerate at most every 30 minutes
const MAX_HEADLINES = 30;

interface BriefPoint {
  theme: string;
  text: string;
  sources: { title: string; source: string; link: string }[];
}

let briefCache: { points: BriefPoint[]; generatedAt: string; timestamp: number } | null = null;

export async function GET(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Daily brief is not configured. Set GEMINI_API_KEY on the server.' },
      { status: 503 }
    );
  }

  if (briefCache && Date.now() - briefCache.timestamp < BRIEF_TTL) {
    return NextResponse.json({ points: briefCache.points, generatedAt: briefCache.generatedAt, cached: true });
  }

  try {
    // Reuse the existing news feed so the brief is built from the same headlines the page shows.
    const origin = new URL(request.url).origin;
    const newsRes = await fetch(`${origin}/api/news`, { cache: 'no-store' });
    if (!newsRes.ok) throw new Error('News feed unavailable');
    const news = (await newsRes.json()) as { items: { title: string; source: string; link: string; pubDate: string }[] };

    const headlines = news.items.slice(0, MAX_HEADLINES);
    if (headlines.length === 0) {
      return NextResponse.json({ points: [], generatedAt: new Date().toISOString() });
    }

    const numbered = headlines
      .map((h, i) => `[${i}] ${h.title} (${h.source}, ${h.pubDate})`)
      .join('\n');

    const prompt = `You are writing a short intelligence-style briefing for a public news dashboard.

Use ONLY the numbered headlines below. Do not add facts, names, numbers or causes that are not in the headlines. If the headlines do not support a claim, leave it out.

Write 5 to 7 points. Group related headlines into one point. Each point must list the headline numbers it is based on.

Return only JSON in this exact shape, with no other text:
[{"theme": "short label, 1-3 words", "text": "one or two plain sentences", "sourceIndexes": [0, 4]}]

Headlines:
${numbered}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        }),
      }
    );

    if (!geminiRes.ok) {
      const detail = await geminiRes.text();
      console.error('Gemini request failed', geminiRes.status, detail.slice(0, 300));
      return NextResponse.json({ error: 'Brief generation failed. Try again later.' }, { status: 502 });
    }

    const data = await geminiRes.json();
    const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
    const parsed = JSON.parse(raw) as { theme: string; text: string; sourceIndexes: number[] }[];

    // Map the model's indexes back to real links. Drop any index that doesn't exist.
    const points: BriefPoint[] = parsed.map((p) => ({
      theme: String(p.theme),
      text: String(p.text),
      sources: (p.sourceIndexes || [])
        .filter((i) => Number.isInteger(i) && headlines[i])
        .map((i) => ({ title: headlines[i].title, source: headlines[i].source, link: headlines[i].link })),
    }));

    const generatedAt = new Date().toISOString();
    briefCache = { points, generatedAt, timestamp: Date.now() };
    return NextResponse.json({ points, generatedAt, cached: false });
  } catch (err) {
    console.error('Brief error', err);
    return NextResponse.json({ error: 'Brief generation failed. Try again later.' }, { status: 500 });
  }
}
