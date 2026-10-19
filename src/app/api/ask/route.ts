import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { deepseekJson, currentHeadlines, Headline } from '@/lib/deepseek';
import { allowRequest, clientIp } from '@/lib/rate-limit';

const MAX_QUESTION = 200;
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT_PER_WINDOW = 10;

interface AskResult {
  answer: string;
  sources: { title: string; source: string; link: string }[];
}

async function answerFromHeadlines(question: string, headlines: Headline[], apiKey: string): Promise<AskResult> {
  const numbered = headlines.map((h, i) => `[${i}] ${h.title} (${h.source}, ${h.pubDate})`).join('\n');
  const prompt = `You answer questions about current news for a public dashboard.

Use ONLY the numbered headlines below. Do not add facts that are not in them.
If the headlines do not answer the question, say that plainly and do not guess.
Keep the answer to 2 to 4 short sentences. Cite the headline numbers you used.

Return only a JSON object in this exact shape, with no other text:
{"answer": "your answer", "sourceIndexes": [0, 3]}

Question: ${question}

Headlines:
${numbered}`;

  const parsed = await deepseekJson<{ answer?: string; sourceIndexes?: number[] }>(prompt, apiKey, 400);
  const sources = (parsed.sourceIndexes || [])
    .filter((i) => Number.isInteger(i) && headlines[i])
    .map((i) => ({ title: headlines[i].title, source: headlines[i].source, link: headlines[i].link }));
  return { answer: String(parsed.answer || 'No answer was returned.'), sources };
}

// Same question against the same headlines gets the cached answer for 30 minutes.
const cachedAnswer = unstable_cache(
  (question: string, headlines: Headline[], apiKey: string) => answerFromHeadlines(question, headlines, apiKey),
  ['ask-feed'],
  { revalidate: 30 * 60 }
);

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'AI answers are not configured yet.' }, { status: 503 });

  if (!allowRequest(`ask:${clientIp(request)}`, LIMIT_PER_WINDOW, WINDOW_MS)) {
    return NextResponse.json({ error: 'You have asked a lot of questions. Try again in a few minutes.' }, { status: 429 });
  }

  let question = '';
  try {
    const body = await request.json();
    question = String(body?.question ?? '').trim();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (question.length < 3 || question.length > MAX_QUESTION) {
    return NextResponse.json({ error: `Ask a question between 3 and ${MAX_QUESTION} characters.` }, { status: 400 });
  }

  try {
    const origin = new URL(request.url).origin;
    const headlines = await currentHeadlines(origin);
    if (headlines.length === 0) return NextResponse.json({ answer: 'There are no headlines to answer from right now.', sources: [] });
    const result = await cachedAnswer(question.toLowerCase(), headlines, apiKey);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Ask error', err);
    return NextResponse.json({ error: 'The answer could not be generated. Try again later.' }, { status: 502 });
  }
}
