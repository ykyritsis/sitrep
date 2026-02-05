import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
});

// Conflict-focused RSS feeds for situation detection - prioritize breaking news sources
const SITUATION_FEEDS = [
  // Google News - most up-to-date
  'https://news.google.com/rss/search?q=ukraine+war+attack&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=israel+gaza+strike&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=iran+protest&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=ICE+immigration+raid&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=syria+conflict&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=yemen+houthi&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=taiwan+china+military&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=north+korea+missile&hl=en-US&gl=US&ceid=US:en',
  // Traditional sources
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://www.aljazeera.com/xml/rss/all.xml',
  'https://kyivindependent.com/feed/',
  'https://www.timesofisrael.com/feed/',
];

// Situation templates - keywords that identify ongoing crises
// These are patterns, not hardcoded situations - the actual data comes from news
const SITUATION_PATTERNS = [
  {
    id: 'ukraine-russia',
    name: 'Russia-Ukraine War',
    region: 'Eastern Europe',
    keywords: ['ukraine', 'russia', 'kyiv', 'moscow', 'zelensky', 'putin', 'donbas', 'crimea', 'kherson', 'zaporizhzhia', 'drone strike', 'oreshnik', 'kursk'],
    parties: ['Russia', 'Ukraine', 'NATO'],
  },
  {
    id: 'israel-gaza',
    name: 'Israel-Gaza Conflict',
    region: 'Middle East',
    keywords: ['israel', 'gaza', 'hamas', 'idf', 'netanyahu', 'hostage', 'ceasefire', 'rafah', 'palestinian', 'tel aviv', 'west bank'],
    parties: ['Israel', 'Hamas', 'Palestine'],
  },
  {
    id: 'israel-hezbollah',
    name: 'Israel-Lebanon Tensions',
    region: 'Middle East',
    keywords: ['hezbollah', 'lebanon', 'beirut', 'nasrallah', 'israel lebanon', 'idf lebanon'],
    parties: ['Israel', 'Hezbollah', 'Lebanon'],
  },
  {
    id: 'iran',
    name: 'Iran Tensions',
    region: 'Middle East',
    keywords: ['iran', 'tehran', 'irgc', 'khamenei', 'iranian', 'nuclear iran', 'sanctions iran'],
    parties: ['Iran', 'USA', 'Israel'],
  },
  {
    id: 'china-taiwan',
    name: 'Taiwan Strait Tensions',
    region: 'East Asia',
    keywords: ['taiwan strait', 'taipei china', 'taiwan china', 'taiwan military', 'taiwan invasion', 'pla taiwan', 'chinese warship', 'taiwan defense'],
    parties: ['China', 'Taiwan', 'USA'],
  },
  {
    id: 'north-korea',
    name: 'North Korea',
    region: 'East Asia',
    keywords: ['north korea', 'pyongyang', 'kim jong', 'dprk', 'korean missile', 'icbm'],
    parties: ['North Korea', 'South Korea', 'USA'],
  },
  {
    id: 'syria',
    name: 'Syria Situation',
    region: 'Middle East',
    keywords: ['syria', 'damascus', 'assad', 'hts', 'idlib', 'aleppo', 'syrian'],
    parties: ['Syria', 'HTS', 'Turkey', 'Russia'],
  },
  {
    id: 'yemen-houthi',
    name: 'Yemen/Red Sea',
    region: 'Middle East',
    keywords: ['yemen', 'houthi', 'red sea', 'aden', 'shipping attack', 'sanaa'],
    parties: ['Houthis', 'Saudi Arabia', 'USA', 'UK'],
  },
  {
    id: 'sudan',
    name: 'Sudan Civil War',
    region: 'Africa',
    keywords: ['sudan', 'khartoum', 'rsf', 'sudanese', 'darfur'],
    parties: ['SAF', 'RSF'],
  },
  {
    id: 'myanmar',
    name: 'Myanmar Conflict',
    region: 'Southeast Asia',
    keywords: ['myanmar', 'burma', 'junta', 'rohingya'],
    parties: ['Military Junta', 'Resistance'],
  },
  {
    id: 'us-immigration',
    name: 'US Immigration',
    region: 'North America',
    keywords: ['ice raid', 'deportation', 'ice arrest', 'immigration enforcement', 'border patrol', 'migrant'],
    parties: ['ICE', 'DHS'],
  },
  {
    id: 'us-politics',
    name: 'US Political Situation',
    region: 'North America',
    keywords: ['trump', 'biden', 'congress', 'senate', 'white house', 'executive order'],
    parties: ['Republicans', 'Democrats'],
  },
  {
    id: 'ethiopia',
    name: 'Ethiopia Conflict',
    region: 'Africa',
    keywords: ['ethiopia', 'tigray', 'amhara', 'addis ababa', 'abiy'],
    parties: ['Ethiopia', 'TPLF', 'Fano'],
  },
  {
    id: 'drc',
    name: 'DRC Conflict',
    region: 'Africa',
    keywords: ['congo', 'drc', 'goma', 'm23', 'kinshasa'],
    parties: ['DRC', 'M23', 'Rwanda'],
  },
  {
    id: 'pakistan',
    name: 'Pakistan Situation',
    region: 'South Asia',
    keywords: ['pakistan', 'islamabad', 'imran khan', 'pti', 'karachi'],
    parties: ['Pakistan', 'PTI', 'Military'],
  },
  {
    id: 'venezuela',
    name: 'Venezuela Crisis',
    region: 'South America',
    keywords: ['venezuela', 'maduro', 'caracas', 'guaido'],
    parties: ['Venezuela', 'Opposition'],
  },
  {
    id: 'haiti',
    name: 'Haiti Crisis',
    region: 'Caribbean',
    keywords: ['haiti', 'port-au-prince', 'gang', 'haitian'],
    parties: ['Haiti', 'Gangs', 'UN'],
  },
  {
    id: 'sahel',
    name: 'Sahel Instability',
    region: 'Africa',
    keywords: ['mali', 'niger', 'burkina faso', 'sahel', 'junta', 'wagner'],
    parties: ['Mali', 'Niger', 'Burkina Faso', 'Wagner'],
  },
  {
    id: 'kashmir',
    name: 'Kashmir Tensions',
    region: 'South Asia',
    keywords: ['kashmir', 'india pakistan', 'loc', 'srinagar'],
    parties: ['India', 'Pakistan'],
  },
  {
    id: 'philippines-china',
    name: 'South China Sea',
    region: 'Southeast Asia',
    keywords: ['south china sea', 'philippines china', 'spratly', 'scarborough'],
    parties: ['Philippines', 'China', 'USA'],
  },
];

interface ArticleRef {
  title: string;
  link: string;
}

interface DetectedSituation {
  id: string;
  name: string;
  region: string;
  parties: string[];
  articleCount: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'escalating' | 'monitoring';
  latestArticles: ArticleRef[];
  lastUpdate: string;
}

// Severity keywords
const CRITICAL_KEYWORDS = ['killed', 'dead', 'attack', 'strike', 'bomb', 'explosion', 'casualties', 'war', 'invasion', 'shot', 'shooting', 'massacre'];
const HIGH_KEYWORDS = ['military', 'troops', 'missile', 'drone', 'offensive', 'combat', 'fighting', 'clashes', 'raid'];
const ESCALATION_KEYWORDS = ['escalat', 'intensif', 'surge', 'major', 'breaking', 'urgent', 'massive', 'widespread', 'erupts', 'erupted'];
const BREAKING_KEYWORDS = ['breaking', 'just in', 'developing', 'urgent', 'live'];

export async function GET() {
  try {
    // Fetch all news articles
    const allArticles: { title: string; pubDate: string; link: string }[] = [];
    
    const feedPromises = SITUATION_FEEDS.map(async (url) => {
      try {
        const parsed = await parser.parseURL(url);
        return parsed.items.slice(0, 15).map(item => ({
          title: item.title || '',
          pubDate: item.pubDate || new Date().toISOString(),
          link: item.link || '',
        }));
      } catch {
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    results.forEach(items => allArticles.push(...items));

    // Detect situations based on keyword matching
    const detectedSituations: DetectedSituation[] = [];

    for (const pattern of SITUATION_PATTERNS) {
      const matchingArticles = allArticles.filter(article => {
        const titleLower = article.title.toLowerCase();
        // Require at least 2 keywords to match for better accuracy
        const matchCount = pattern.keywords.filter(kw => titleLower.includes(kw.toLowerCase())).length;
        return matchCount >= 1 && pattern.keywords.some(kw => {
          // For multi-word keywords, require exact match
          if (kw.includes(' ')) {
            return titleLower.includes(kw.toLowerCase());
          }
          // For single words, use word boundary check
          const regex = new RegExp(`\\b${kw.toLowerCase()}\\b`);
          return regex.test(titleLower);
        });
      });

      if (matchingArticles.length >= 2) {
        // Determine severity based on headlines
        const allTitles = matchingArticles.map(a => a.title.toLowerCase()).join(' ');
        
        let severity: 'critical' | 'high' | 'medium' | 'low' = 'low';
        if (CRITICAL_KEYWORDS.some(kw => allTitles.includes(kw))) {
          severity = 'critical';
        } else if (HIGH_KEYWORDS.some(kw => allTitles.includes(kw))) {
          severity = 'high';
        } else if (matchingArticles.length >= 3) {
          severity = 'medium';
        }

        // Determine status
        let status: 'active' | 'escalating' | 'monitoring' = 'monitoring';
        if (ESCALATION_KEYWORDS.some(kw => allTitles.includes(kw))) {
          status = 'escalating';
        } else if (matchingArticles.length >= 2 || severity === 'critical' || severity === 'high') {
          status = 'active';
        }

        // Get latest articles with links (deduplicated by title)
        const seenTitles = new Set<string>();
        const latestArticles: ArticleRef[] = [];
        for (const article of matchingArticles) {
          if (!seenTitles.has(article.title) && latestArticles.length < 4) {
            seenTitles.add(article.title);
            latestArticles.push({ title: article.title, link: article.link });
          }
        }

        // Find most recent article date
        const latestDate = matchingArticles
          .map(a => new Date(a.pubDate).getTime())
          .reduce((max, d) => Math.max(max, d), 0);

        detectedSituations.push({
          id: pattern.id,
          name: pattern.name,
          region: pattern.region,
          parties: pattern.parties,
          articleCount: matchingArticles.length,
          severity,
          status,
          latestArticles,
          lastUpdate: new Date(latestDate).toISOString(),
        });
      }
    }

    // Check if situation has breaking news
    const hasBreaking = (articles: ArticleRef[]) => {
      return articles.some(a => BREAKING_KEYWORDS.some(kw => a.title.toLowerCase().includes(kw)));
    };

    // Sort: breaking first, then escalating, then by severity, then by article count
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const statusOrder = { escalating: 0, active: 1, monitoring: 2 };
    detectedSituations.sort((a, b) => {
      // Breaking news first
      const aBreaking = hasBreaking(a.latestArticles);
      const bBreaking = hasBreaking(b.latestArticles);
      if (aBreaking && !bBreaking) return -1;
      if (!aBreaking && bBreaking) return 1;
      
      // Then by status (escalating first)
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      
      // Then by severity
      const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (sevDiff !== 0) return sevDiff;
      
      // Then by article count
      return b.articleCount - a.articleCount;
    });

    return NextResponse.json({
      situations: detectedSituations,
      timestamp: new Date().toISOString(),
      totalArticlesAnalyzed: allArticles.length,
    });
  } catch (error) {
    console.error('Situations API error:', error);
    return NextResponse.json({ situations: [], error: 'Failed to detect situations' }, { status: 500 });
  }
}
