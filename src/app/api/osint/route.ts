import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
});

// Real OSINT and conflict monitoring RSS feeds (verified working)
const OSINT_FEEDS = [
  // OSINT & Investigations
  { url: 'https://www.bellingcat.com/feed/', source: 'Bellingcat', verified: true },
  { url: 'https://www.longwarjournal.org/feed', source: 'Long War Journal', verified: true },
  { url: 'https://warontherocks.com/feed/', source: 'War on the Rocks', verified: true },
  
  // Think Tanks & Analysis
  { url: 'https://www.rand.org/blog.xml', source: 'RAND', verified: true },
  { url: 'https://www.atlanticcouncil.org/feed/', source: 'Atlantic Council', verified: true },
  { url: 'https://www.csis.org/rss.xml', source: 'CSIS', verified: true },
  
  // Conflict Monitoring
  { url: 'https://reliefweb.int/updates/rss.xml', source: 'ReliefWeb', verified: true },
  
  // Nuclear & WMD
  { url: 'https://www.armscontrol.org/rss.xml', source: 'Arms Control', verified: true },
  { url: 'https://thebulletin.org/feed/', source: 'Bulletin', verified: true },
];

// Check if text is English
function isEnglish(text: string): boolean {
  if (!text) return false;
  const nonLatinPattern = /[\u0400-\u04FF\u0600-\u06FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/;
  return !nonLatinPattern.test(text);
}

// Keywords for relevant OSINT content
const OSINT_KEYWORDS = [
  'ukraine', 'russia', 'israel', 'gaza', 'iran', 'china', 'taiwan', 'north korea',
  'military', 'weapon', 'missile', 'nuclear', 'war', 'conflict', 'attack', 'strike',
  'intelligence', 'satellite', 'investigation', 'verified', 'geolocated',
  'troops', 'forces', 'combat', 'offensive', 'defense'
];

export async function GET() {
  try {
    const feedPromises = OSINT_FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        return parsed.items.slice(0, 8).map((item, index) => ({
          id: `${feed.source}-${index}-${Date.now()}`,
          author: feed.source,
          handle: `@${feed.source.replace(/\s/g, '')}`,
          content: item.title || '',
          snippet: item.contentSnippet?.substring(0, 200) || '',
          timestamp: item.pubDate || new Date().toISOString(),
          link: item.link,
          source: 'rss' as const,
          verified: feed.verified,
        }));
      } catch (error) {
        console.error(`Failed to fetch ${feed.source}:`, error);
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    let allPosts = results.flat();

    // Filter: English only and relevant content
    allPosts = allPosts.filter(post => {
      if (!isEnglish(post.content)) return false;
      const lower = post.content.toLowerCase();
      return OSINT_KEYWORDS.some(kw => lower.includes(kw));
    });

    // Deduplicate by title
    const seen = new Set<string>();
    allPosts = allPosts.filter(post => {
      const key = post.content.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 40);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by date
    allPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      posts: allPosts.slice(0, 20),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('OSINT API error:', error);
    return NextResponse.json({ posts: [], error: 'Failed to fetch OSINT' }, { status: 500 });
  }
}
