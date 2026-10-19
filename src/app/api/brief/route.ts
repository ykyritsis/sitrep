import { NextResponse } from 'next/server';

// Server-side only. The key is read from the environment and never sent to the browser.
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const BRIEF_TTL = 30 * 60 * 1000; // regenerate at most every 30 minutes
const MAX_HEADLINES = 30;

interface BriefPoint {
  theme: string;
  text: string;
  sources: { title: string; source: string; link: string }[];
}

let briefCache: { points: BriefPoint[]; generatedAt: string; timestamp: number } | null = null;

export async function GET(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Daily brief is not configured. Set DEEPSEEK_API_KEY on the server.' },
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

Write 3 or 4 points. Group related headlines into one point. Each text must be one short sentence of 20 words or fewer. Each point must list the headline numbers it is based on.

Return only a JSON object in this exact shape, with no other text:
{"points": [{"theme": "short label, 1-3 words", "text": "one or two plain sentences", "sourceIndexes": [0, 4]}]}

Headlines:
${numbered}`;

    const deepseekRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!deepseekRes.ok) {
      const detail = await deepseekRes.text();
      console.error("DeepSeek request failed", deepseekRes.status, detail.slice(0, 300));
      return NextResponse.json({ error: "Brief generation failed. Try again later." }, { status: 502 });
    }

    const data = await deepseekRes.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "{}";
    const parsed = (JSON.parse(raw) as { points?: { theme: string; text: string; sourceIndexes: number[] }[] }).points ?? [];

    // Map the model indexes back to real links. Drop any index that does not exist.
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
