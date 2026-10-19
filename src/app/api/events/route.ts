import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { extractLocation, extractEventType, extractSeverity } from '@/lib/locations';

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
});

// Exclude local crime/accidents - not geopolitical
const EXCLUDE_PATTERNS = [
  // Local crime
  'house fire', 'apartment fire', 'building fire', 'car fire',
  'traffic accident', 'car crash', 'vehicle crash', 'road accident',
  'stabbing', 'stabbed', 'robbery', 'burglary', 'theft',
  'domestic violence', 'assault', 'murder suspect', 'homicide',
  'drug bust', 'drug raid', 'overdose', 'drunk driver',
  'suspended sentence', 'driver who killed', 'pleaded guilty',
  // Local incidents
  'missing person', 'amber alert', 'silver alert',
  'power outage', 'water main', 'gas leak',
  'school lockdown', 'bomb threat', 'suspicious package',
  // Natural disasters
  'bushfire', 'wildfire', 'forest fire', 'brush fire',
  'earthquake', 'tsunami', 'hurricane', 'tornado', 'cyclone',
  'flood', 'flooding', 'landslide', 'avalanche',
  // India local news
  'delhi court', 'lalu prasad', 'land-for-jobs', 'scam case',
  'rjd chief', 'bjp leader', 'congress leader',
  'cricket', 'ipl', 'bcci',
  // Analysis/opinion
  'what is', 'who is', 'explainer', 'analysis', 'opinion',
  'how does', 'why does', 'a look at', 'in depth',
  // Entertainment/sports
  'movie', 'film', 'album', 'concert', 'celebrity',
  'football', 'soccer', 'basketball', 'tennis', 'olympics',
  'golden globes', 'oscars', 'emmys', 'grammys',
  // Business/tech
  'stock market', 'earnings report', 'ipo', 'merger',
  'iphone', 'android', 'app store', 'crypto', 'bitcoin',
];

// MUST contain at least one of these geopolitical keywords
const GEOPOLITICAL_KEYWORDS = [
  // Military/conflict
  'military', 'troops', 'soldiers', 'army', 'navy', 'air force',
  'missile', 'drone', 'airstrike', 'strike', 'attack', 'offensive',
  'war', 'conflict', 'combat', 'battle', 'fighting', 'clashes',
  'killed', 'casualties', 'wounded', 'dead',
  // Weapons
  'bomb', 'explosion', 'artillery', 'tank', 'warship', 'fighter jet',
  // Political/diplomatic
  'sanctions', 'embassy', 'diplomat', 'treaty', 'summit',
  'president', 'prime minister', 'government', 'regime',
  'coup', 'election', 'referendum', 'parliament',
  // Security
  'terrorism', 'terrorist', 'insurgent', 'militia', 'rebel',
  'border', 'invasion', 'occupation', 'annexation',
  // Humanitarian crisis
  'refugee', 'evacuation', 'humanitarian', 'crisis',
  // Specific actors
  'nato', 'un', 'eu', 'pentagon', 'kremlin', 'idf', 'hamas', 'hezbollah',
  'houthi', 'isis', 'taliban', 'wagner',
];

// RSS feeds focused on breaking news and conflicts - MASSIVELY expanded for more globe events
const EVENT_FEEDS = [
  // Google News - Breaking by region (more specific queries)
  { url: 'https://news.google.com/rss/search?q=breaking+attack+OR+strike+OR+killed&hl=en-US&gl=US&ceid=US:en', source: 'Breaking' },
  { url: 'https://news.google.com/rss/search?q=ukraine+russia+war+military&hl=en-US&gl=US&ceid=US:en', source: 'Breaking' },
  { url: 'https://news.google.com/rss/search?q=ukraine+drone+missile&hl=en-US&gl=US&ceid=US:en', source: 'Breaking' },
  { url: 'https://news.google.com/rss/search?q=israel+gaza+hamas+idf&hl=en-US&gl=US&ceid=US:en', source: 'Breaking' },
  { url: 'https://news.google.com/rss/search?q=israel+hezbollah+lebanon&hl=en-US&gl=US&ceid=US:en', source: 'Breaking' },
  { url: 'https://news.google.com/rss/search?q=iran+nuclear+military&hl=en-US&gl=US&ceid=US:en', source: 'Breaking' },
  { url: 'https://news.google.com/rss/search?q=ICE+immigration+raid+deportation&hl=en-US&gl=US&ceid=US:en', source: 'Breaking' },
  { url: 'https://news.google.com/rss/search?q=china+taiwan+military+navy&hl=en-US&gl=US&ceid=US:en', source: 'Breaking' },
  { url: 'https://news.google.com/rss/search?q=north+korea+missile+nuclear&hl=en-US&gl=US&ceid=US:en', source: 'Breaking' },
  { url: 'https://news.google.com/rss/search?q=syria+airstrike+military&hl=en-US&gl=US&ceid=US:en', source: 'Breaking' },
  { url: 'https://news.google.com/rss/search?q=yemen+houthi+red+sea&hl=en-US&gl=US&ceid=US:en', source: 'Breaking' },
  { url: 'https://news.google.com/rss/search?q=sudan+conflict+military&hl=en-US&gl=US&ceid=US:en', source: 'Breaking' },
  { url: 'https://news.google.com/rss/search?q=venezuela+maduro+crisis&hl=en-US&gl=US&ceid=US:en', source: 'Breaking' },
  { url: 'https://news.google.com/rss/search?q=nato+military+troops&hl=en-US&gl=US&ceid=US:en', source: 'Breaking' },
  { url: 'https://news.google.com/rss/search?q=pentagon+military+defense&hl=en-US&gl=US&ceid=US:en', source: 'Breaking' },
  { url: 'https://news.google.com/rss/search?q=airstrike+bombing+military&hl=en-US&gl=US&ceid=US:en', source: 'Breaking' },
  { url: 'https://news.google.com/rss/search?q=troops+deployed+military&hl=en-US&gl=US&ceid=US:en', source: 'Breaking' },
  { url: 'https://news.google.com/rss/search?q=sanctions+russia+iran+china&hl=en-US&gl=US&ceid=US:en', source: 'Breaking' },
  // Major news sources
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
  { url: 'https://kyivindependent.com/feed/', source: 'Kyiv Independent' },
  { url: 'https://www.timesofisrael.com/feed/', source: 'Times of Israel' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NYT' },
  { url: 'https://feeds.washingtonpost.com/rss/world', source: 'WaPo' },
  { url: 'https://www.theguardian.com/world/rss', source: 'Guardian' },
  { url: 'https://www.scmp.com/rss/91/feed', source: 'SCMP' },
];

interface GlobeEvent {
  id: string;
  type: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  sourceUrl: string;
  region: string;
}

export async function GET() {
  try {
    const feedPromises = EVENT_FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        return parsed.items.slice(0, 25).map((item) => ({
          title: item.title || '',
          link: item.link || '',
          pubDate: item.pubDate || new Date().toISOString(),
          snippet: item.contentSnippet?.substring(0, 200) || '',
          source: feed.source,
        }));
      } catch (error) {
        console.error(`Failed to fetch ${feed.source}:`, error);
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    const allItems = results.flat();

    // Extract events with locations
    const events: GlobeEvent[] = [];
    const seenLocations = new Set<string>();

    for (const item of allItems) {
      const fullText = `${item.title} ${item.snippet}`.toLowerCase();
      
      // FILTER 1: Exclude local crime/accidents/irrelevant content
      const shouldExclude = EXCLUDE_PATTERNS.some(pattern => fullText.includes(pattern));
      if (shouldExclude) continue;
      
      // FILTER 2: MUST contain geopolitical keyword
      const isGeopolitical = GEOPOLITICAL_KEYWORDS.some(kw => fullText.includes(kw));
      if (!isGeopolitical) continue;
      
      const location = extractLocation(fullText);
      
      if (location) {
        // Allow multiple events per general area (use less precise key)
        const locationKey = `${location.lat.toFixed(0)},${location.lng.toFixed(0)}-${item.title.substring(0, 20)}`;
        
        // Skip exact duplicates only
        if (seenLocations.has(locationKey)) continue;
        seenLocations.add(locationKey);

        const eventType = extractEventType(fullText);
        const severity = extractSeverity(fullText);

        // Clean up title
        let cleanTitle = item.title
          .replace(/ - [A-Za-z\s]+$/, '')
          .replace(/\s*\|.*$/, '')
          .trim();
        if (cleanTitle.length > 70) {
          cleanTitle = cleanTitle.substring(0, 67) + '...';
        }

        // Larger scatter radius to spread out clustered events
        const scatterRadius = 2.2; // degrees
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * scatterRadius;
        const latOffset = Math.sin(angle) * distance;
        const lngOffset = Math.cos(angle) * distance;

        events.push({
          id: `event-${events.length}-${Date.now()}`,
          type: eventType,
          lat: location.lat + latOffset,
          lng: location.lng + lngOffset,
          title: cleanTitle,
          description: item.snippet || item.title,
          timestamp: item.pubDate,
          severity,
          source: item.source,
          sourceUrl: item.link,
          region: location.region,
        });
      }
    }

    // Sort by severity (critical first) then by date
    events.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return NextResponse.json({
      events: events.slice(0, 400),
      timestamp: new Date().toISOString(),
      count: events.length,
    });
  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json({ events: [], error: 'Failed to fetch events' }, { status: 500 });
  }
}
