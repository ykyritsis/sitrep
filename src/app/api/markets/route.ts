import { NextResponse } from 'next/server';

// Polymarket Gamma API - Free, no auth required
// https://gamma-api.polymarket.com

interface MarketAnswer {
  id: string;
  text: string;
  probability: number;
}

// Keywords for geopolitical/conflict markets - EXPANDED
const RELEVANT_KEYWORDS = [
  // Conflicts & Violence
  'war', 'invade', 'invasion', 'attack', 'strike', 'bomb', 'missile',
  'assassinate', 'assassinated', 'assassination', 'killed', 'dies', 'death',
  'military', 'conflict', 'troops', 'capture', 'occupy', 'annex',
  'ceasefire', 'peace', 'surrender', 'defeat', 'victory',
  // Actors
  'ukraine', 'russia', 'israel', 'gaza', 'iran', 'china', 'taiwan',
  'hamas', 'hezbollah', 'houthi', 'isis', 'taliban', 'wagner',
  // Politics
  'trump', 'president', 'election', 'presidential', 'nominee', 'democratic', 'republican',
  'biden', 'harris', 'vance', 'desantis', 'newsom', 'haley',
  'prime minister', 'parliament', 'government', 'vote', 'impeach', 'resign',
  // Geopolitics
  'nato', 'nuclear', 'syria', 'korea', 'kim jong', 'xi jinping', 'putin', 'zelensky',
  'sanctions', 'tariff', 'deport', 'immigration', 'border', 'coup',
  'doge', 'spending', 'revenue', 'fed', 'interest rate',
  // Countries
  'venezuela', 'maduro', 'hungary', 'netherlands', 'canada', 'mexico', 'poland', 'germany',
];

export async function GET() {
  try {
    // Fetch EVENTS from Polymarket (groups related markets together)
    const response = await fetch(
      'https://gamma-api.polymarket.com/events?active=true&closed=false&limit=150',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error('Polymarket API failed');
    }

    const allEvents = await response.json();

    // Filter for relevant geopolitical events
    const relevantEvents = allEvents.filter((e: any) => {
      const text = (e.title || '').toLowerCase();
      return RELEVANT_KEYWORDS.some(kw => text.includes(kw));
    });

    // Sort by volume (highest first)
    relevantEvents.sort((a: any, b: any) => {
      const aVol = parseFloat(a.volume) || 0;
      const bVol = parseFloat(b.volume) || 0;
      return bVol - aVol;
    });

    const markets = relevantEvents.slice(0, 20).map((event: any) => {
      // Get markets within this event
      const eventMarkets = event.markets || [];
      let probability = 0.5;
      let answers: MarketAnswer[] = [];
      
      if (eventMarkets.length === 1) {
        // Single market event (binary Yes/No)
        const market = eventMarkets[0];
        try {
          const prices = JSON.parse(market.outcomePrices || '[]');
          probability = parseFloat(prices[0]) || 0.5;
        } catch (e) {}
      } else if (eventMarkets.length > 1) {
        // Multiple markets = multiple choice options
        answers = eventMarkets
          .filter((m: any) => !m.closed)
          .map((m: any) => {
            let prob = 0.5;
            try {
              const prices = JSON.parse(m.outcomePrices || '[]');
              prob = parseFloat(prices[0]) || 0;
            } catch (e) {}
            return {
              id: m.id,
              text: m.groupItemTitle || m.question,
              probability: prob,
            };
          })
          .filter((a: MarketAnswer) => a.probability > 0.01)
          .sort((a: MarketAnswer, b: MarketAnswer) => b.probability - a.probability)
          .slice(0, 8);
      }

      return {
        id: event.id,
        question: event.title,
        probability,
        volume: parseFloat(event.volume) || 0,
        category: categorizeMarket(event.title),
        url: `https://polymarket.com/event/${event.slug}`,
        outcomeType: answers.length > 0 ? 'MULTIPLE_CHOICE' : 'BINARY',
        answers,
      };
    });

    return NextResponse.json({ markets, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Polymarket API error:', error);
    return NextResponse.json({ markets: [], error: 'Failed to fetch markets' }, { status: 500 });
  }
}

function categorizeMarket(question: string): string {
  const q = question?.toLowerCase() || '';
  if (q.includes('war') || q.includes('military') || q.includes('ukraine') || q.includes('israel') || q.includes('conflict')) return 'conflict';
  if (q.includes('election') || q.includes('president') || q.includes('trump') || q.includes('biden') || q.includes('vote')) return 'politics';
  if (q.includes('crypto') || q.includes('bitcoin') || q.includes('stock') || q.includes('fed') || q.includes('economy')) return 'financial';
  if (q.includes('ai') || q.includes('tech') || q.includes('openai') || q.includes('google')) return 'technology';
  return 'other';
}
