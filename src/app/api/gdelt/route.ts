import { NextResponse } from 'next/server';

// GDELT GKG (Global Knowledge Graph) API - Free, no auth required
// Tracks global events in near real-time

interface GDELTEvent {
  id: string;
  title: string;
  url: string;
  domain: string;
  language: string;
  seendate: string;
  socialimage: string;
  tone: number;
  themes: string[];
  locations: Array<{
    name: string;
    type: string;
    lat: number;
    lng: number;
    countryCode: string;
  }>;
}

// Check if text is English
function isEnglish(text: string): boolean {
  if (!text) return false;
  const nonLatinPattern = /[\u0400-\u04FF\u0600-\u06FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/;
  return !nonLatinPattern.test(text);
}

export async function GET() {
  try {
    // Use more specific queries for better results
    const queries = [
      'ukraine missile strike',
      'israel gaza attack',
      'iran protest',
      'ice immigration raid',
      'military troops deploy',
    ];
    
    const allEvents: GDELTEvent[] = [];
    
    for (const query of queries) {
      try {
        // GDELT DOC API
        const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=15&format=json&timespan=24h`;
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.articles) {
            for (const article of data.articles) {
              // Filter for English only (client-side since API filter doesn't work well)
              if (article.language && article.language.toLowerCase() !== 'english') continue;
              if (!isEnglish(article.title)) continue;
              
              allEvents.push({
                id: article.url || `gdelt-${Date.now()}-${Math.random()}`,
                title: article.title || 'No title',
                url: article.url || '',
                domain: article.domain || '',
                language: article.language || 'English',
                seendate: article.seendate || new Date().toISOString(),
                socialimage: article.socialimage || '',
                tone: article.tone || 0,
                themes: [],
                locations: [],
              });
            }
          }
        }
      } catch (err) {
        console.error(`GDELT query failed for "${query}":`, err);
      }
    }

    // Deduplicate by URL
    const seen = new Set<string>();
    const uniqueEvents = allEvents.filter(e => {
      if (seen.has(e.url)) return false;
      seen.add(e.url);
      return true;
    });

    // Sort by date
    uniqueEvents.sort((a, b) => {
      const dateA = new Date(a.seendate).getTime();
      const dateB = new Date(b.seendate).getTime();
      return dateB - dateA;
    });

    // Transform for frontend
    const events = uniqueEvents.slice(0, 30).map(e => ({
      id: e.id,
      title: e.title,
      url: e.url,
      source: e.domain,
      timestamp: e.seendate,
      image: e.socialimage,
      tone: e.tone, // Negative = negative sentiment
      category: categorizeByTitle(e.title),
    }));

    return NextResponse.json({
      events,
      timestamp: new Date().toISOString(),
      count: events.length,
    });
  } catch (error) {
    console.error('GDELT API error:', error);
    return NextResponse.json({ events: [], error: 'Failed to fetch GDELT data' }, { status: 500 });
  }
}

function categorizeByTitle(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('war') || t.includes('military') || t.includes('troops')) return 'military';
  if (t.includes('attack') || t.includes('strike') || t.includes('bomb')) return 'attack';
  if (t.includes('protest') || t.includes('unrest') || t.includes('riot')) return 'unrest';
  if (t.includes('election') || t.includes('vote') || t.includes('government')) return 'political';
  if (t.includes('economy') || t.includes('trade') || t.includes('sanction')) return 'economic';
  return 'general';
}
