import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { NewsItem, RelatedArticle } from '@/types';

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
});

// In-memory cache for news items (shared across requests)
let newsCache: { items: NewsItem[]; timestamp: number } | null = null;
const CACHE_TTL = 30 * 1000; // 30 second cache for fresher updates

const RSS_FEEDS = [
  // Google News - Breaking/Trending (aggregates all sources) - EXPANDED
  { url: 'https://news.google.com/rss/search?q=breaking+ukraine+OR+russia&hl=en-US&gl=US&ceid=US:en', source: 'Breaking', category: 'conflict' },
  { url: 'https://news.google.com/rss/search?q=breaking+israel+OR+gaza+OR+hamas&hl=en-US&gl=US&ceid=US:en', source: 'Breaking', category: 'conflict' },
  { url: 'https://news.google.com/rss/search?q=breaking+iran+OR+tehran&hl=en-US&gl=US&ceid=US:en', source: 'Breaking', category: 'conflict' },
  { url: 'https://news.google.com/rss/search?q=ICE+raid+OR+deportation+OR+immigration&hl=en-US&gl=US&ceid=US:en', source: 'Breaking', category: 'conflict' },
  { url: 'https://news.google.com/rss/search?q=missile+strike+OR+airstrike&hl=en-US&gl=US&ceid=US:en', source: 'Breaking', category: 'conflict' },
  // Trump & US Foreign Policy
  { url: 'https://news.google.com/rss/search?q=trump+mexico+cartel+OR+military&hl=en-US&gl=US&ceid=US:en', source: 'Breaking', category: 'conflict' },
  { url: 'https://news.google.com/rss/search?q=trump+tariff+OR+sanctions&hl=en-US&gl=US&ceid=US:en', source: 'Breaking', category: 'conflict' },
  { url: 'https://news.google.com/rss/search?q=trump+china+OR+taiwan&hl=en-US&gl=US&ceid=US:en', source: 'Breaking', category: 'conflict' },
  { url: 'https://news.google.com/rss/search?q=trump+nato+OR+europe&hl=en-US&gl=US&ceid=US:en', source: 'Breaking', category: 'conflict' },
  { url: 'https://news.google.com/rss/search?q=trump+putin+OR+russia&hl=en-US&gl=US&ceid=US:en', source: 'Breaking', category: 'conflict' },
  // More conflict zones
  { url: 'https://news.google.com/rss/search?q=syria+military+OR+airstrike&hl=en-US&gl=US&ceid=US:en', source: 'Breaking', category: 'conflict' },
  { url: 'https://news.google.com/rss/search?q=yemen+houthi+OR+red+sea&hl=en-US&gl=US&ceid=US:en', source: 'Breaking', category: 'conflict' },
  { url: 'https://news.google.com/rss/search?q=north+korea+missile+OR+nuclear&hl=en-US&gl=US&ceid=US:en', source: 'Breaking', category: 'conflict' },
  { url: 'https://news.google.com/rss/search?q=china+taiwan+military&hl=en-US&gl=US&ceid=US:en', source: 'Breaking', category: 'conflict' },
  { url: 'https://news.google.com/rss/search?q=venezuela+maduro+OR+crisis&hl=en-US&gl=US&ceid=US:en', source: 'Breaking', category: 'conflict' },
  // Military & Defense
  { url: 'https://news.google.com/rss/search?q=pentagon+military+troops&hl=en-US&gl=US&ceid=US:en', source: 'Breaking', category: 'conflict' },
  { url: 'https://news.google.com/rss/search?q=nato+troops+OR+military&hl=en-US&gl=US&ceid=US:en', source: 'Breaking', category: 'conflict' },
  
  // Major US Networks
  { url: 'https://moxie.foxnews.com/google-publisher/world.xml', source: 'Fox News', category: 'conflict' },
  { url: 'http://rss.cnn.com/rss/edition_world.rss', source: 'CNN', category: 'conflict' },
  { url: 'https://feeds.nbcnews.com/nbcnews/public/world', source: 'NBC', category: 'conflict' },
  { url: 'https://feeds.cbsnews.com/CBSNewsWorld', source: 'CBS', category: 'conflict' },
  { url: 'https://feeds.abcnews.com/abcnews/internationalheadlines', source: 'ABC', category: 'conflict' },
  
  // Wire Services
  { url: 'https://www.reutersagency.com/feed/?best-topics=political-general&post_type=best', source: 'Reuters', category: 'conflict' },
  { url: 'https://feeds.apnews.com/rss/apf-topnews', source: 'AP', category: 'conflict' },
  { url: 'https://www.upi.com/rss/TopNews/', source: 'UPI', category: 'conflict' },
  
  // Major International
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC', category: 'conflict' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NYT', category: 'conflict' },
  { url: 'https://www.theguardian.com/world/rss', source: 'Guardian', category: 'conflict' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', category: 'conflict' },
  { url: 'https://www.france24.com/en/rss', source: 'France24', category: 'conflict' },
  { url: 'https://www.dw.com/rss/en/top-stories/s-9097', source: 'DW', category: 'conflict' },
  
  // Defense & Military
  { url: 'https://www.thedrive.com/the-war-zone/feed', source: 'War Zone', category: 'conflict' },
  { url: 'https://breakingdefense.com/feed/', source: 'Breaking Defense', category: 'conflict' },
  
  // Middle East
  { url: 'https://www.timesofisrael.com/feed/', source: 'Times of Israel', category: 'conflict' },
  { url: 'https://www.jpost.com/rss/rssfeedsheadlines.aspx', source: 'Jerusalem Post', category: 'conflict' },
  { url: 'https://english.alarabiya.net/tools/rss', source: 'Al Arabiya', category: 'conflict' },
  
  // Ukraine/Russia
  { url: 'https://kyivindependent.com/feed/', source: 'Kyiv Independent', category: 'conflict' },
  { url: 'https://www.pravda.com.ua/eng/rss/', source: 'Ukr Pravda', category: 'conflict' },
  { url: 'https://meduza.io/rss/en/all', source: 'Meduza', category: 'conflict' },
  
  // Asia-Pacific
  { url: 'https://www.scmp.com/rss/91/feed', source: 'SCMP', category: 'conflict' },
  { url: 'https://www3.nhk.or.jp/nhkworld/en/news/rss/index.xml', source: 'NHK Japan', category: 'conflict' },
  { url: 'https://www.abc.net.au/news/feed/2942460/rss.xml', source: 'ABC Australia', category: 'conflict' },
  { url: 'https://www.channelnewsasia.com/rssfeeds/8395986', source: 'CNA Singapore', category: 'conflict' },
  { url: 'https://en.yna.co.kr/RSS/news.xml', source: 'Yonhap Korea', category: 'conflict' },
  
  // Europe
  { url: 'https://www.euronews.com/rss?level=theme&name=news', source: 'Euronews', category: 'conflict' },
  { url: 'https://www.politico.eu/feed/', source: 'Politico EU', category: 'conflict' },
  
  // OSINT & Intelligence Sources (often faster than mainstream)
  { url: 'https://www.bellingcat.com/feed/', source: 'Bellingcat', category: 'conflict' },
  { url: 'https://www.criticalthreats.org/feed', source: 'Critical Threats', category: 'conflict' },
  { url: 'https://www.longwarjournal.org/feed', source: 'Long War Journal', category: 'conflict' },
  { url: 'https://www.understandingwar.org/feed', source: 'ISW', category: 'conflict' },
  
  // Live Updates & Wire-style
  { url: 'https://www.liveuamap.com/rss', source: 'LiveUAMap', category: 'conflict' },
  { url: 'https://english.aawsat.com/feed', source: 'Asharq Al-Awsat', category: 'conflict' },
  { url: 'https://www.middleeasteye.net/rss', source: 'Middle East Eye', category: 'conflict' },
  
  // Government & Official Sources
  { url: 'https://www.state.gov/rss-feed/press-releases/feed/', source: 'State Dept', category: 'conflict' },
  { url: 'https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?max=10&ContentType=1&Site=945', source: 'DoD', category: 'conflict' },
  
  // Think Tanks & Analysis
  { url: 'https://www.csis.org/analysis/feed', source: 'CSIS', category: 'conflict' },
  { url: 'https://www.rand.org/topics/international-affairs.xml', source: 'RAND', category: 'conflict' },
  { url: 'https://carnegieendowment.org/rss/solr/?fa=experts', source: 'Carnegie', category: 'conflict' },
  
  // Additional Breaking News
  { url: 'https://news.google.com/rss/search?q=BREAKING+military+OR+attack+OR+war&hl=en-US&gl=US&ceid=US:en', source: 'Breaking', category: 'conflict' },
  { url: 'https://news.google.com/rss/search?q=URGENT+breaking+news&hl=en-US&gl=US&ceid=US:en', source: 'Breaking', category: 'conflict' },
  
  // Telegram-style aggregators (via RSS)
  { url: 'https://rsshub.app/telegram/channel/inikiforov', source: 'Intel Slava', category: 'conflict' },
  { url: 'https://rsshub.app/telegram/channel/ryaborig', source: 'Rybar', category: 'conflict' },
];

const KEYWORDS_HIGH_SEVERITY = [
  'breaking', 'urgent', 'attack', 'explosion', 'missile', 'nuclear', 
  'war', 'invasion', 'strike', 'killed', 'dead', 'troops', 'military',
  'airstrike', 'bombing', 'casualties', 'offensive', 'combat'
];

const KEYWORDS_MEDIUM_SEVERITY = [
  'tension', 'conflict', 'crisis', 'threat', 'sanctions', 'warning',
  'escalation', 'troops', 'border', 'protest', 'unrest', 'deployment',
  'ceasefire', 'negotiation', 'diplomatic', 'defense', 'weapons'
];

// Keywords that indicate geopolitical/military content (prioritized) - EXPANDED
const PRIORITY_KEYWORDS = [
  // Ukraine/Russia
  'ukraine', 'russia', 'putin', 'zelensky', 'kyiv', 'moscow', 'donbas', 'crimea', 'lviv', 'kharkiv', 'odesa',
  'kremlin', 'russian', 'ukrainian', 'kursk', 'belgorod',
  // Israel/Middle East
  'israel', 'gaza', 'hamas', 'idf', 'netanyahu', 'hezbollah', 'lebanon',
  'iran', 'tehran', 'irgc', 'khamenei', 'iranian', 'ayatollah',
  'syria', 'assad', 'damascus', 'aleppo',
  'yemen', 'houthi', 'sanaa',
  'iraq', 'baghdad',
  'saudi', 'riyadh', 'mbs',
  // Asia
  'china', 'taiwan', 'beijing', 'pla', 'xi jinping', 'chinese',
  'north korea', 'pyongyang', 'kim jong', 'dprk',
  'south korea', 'seoul',
  'japan', 'tokyo',
  'india', 'modi', 'kashmir',
  'pakistan', 'islamabad',
  // Military/Defense
  'nato', 'pentagon', 'military', 'troops', 'defense', 'army', 'navy', 'air force',
  'missile', 'drone', 'airstrike', 'bombing', 'attack', 'strike', 'killed', 'dead',
  'war', 'conflict', 'invasion', 'offensive', 'casualties',
  'nuclear', 'uranium', 'enrichment', 'warhead',
  // US Politics & Foreign Policy
  'trump', 'biden', 'white house', 'state department', 'cia', 'nsa',
  'cartel', 'mexico', 'tariff', 'sanctions', 'border',
  'ice', 'deportation', 'immigration', 'ice raid',
  // World Leaders & Political Statements
  'president', 'prime minister', 'chancellor', 'foreign minister',
  'macron', 'scholz', 'starmer', 'sunak', 'meloni', 'erdogan',
  'says', 'warns', 'threatens', 'announces', 'declares', 'vows', 'demands',
  'reportedly', 'allegedly', 'sources say', 'officials say',
  'flee', 'fleeing', 'escape', 'exile', 'resign', 'resignation',
  // Latin America
  'maduro', 'venezuela', 'cuba', 'havana', 'haiti',
  'brazil', 'lula', 'argentina', 'milei',
  // Africa
  'sudan', 'khartoum', 'ethiopia', 'somalia', 'libya', 'niger', 'mali',
  // Other actors
  'wagner', 'isis', 'taliban', 'al-qaeda', 'al qaeda',
  // Diplomacy
  'ceasefire', 'peace talks', 'negotiation', 'summit', 'treaty', 'agreement',
  'embassy', 'diplomat', 'ambassador',
  'coup', 'assassination', 'overthrow', 'regime change',
  // Europe
  'eu', 'european union', 'brussels', 'nato',
  'uk', 'britain', 'london',
  'france', 'paris', 'germany', 'berlin', 'poland', 'warsaw',
];

// Keywords to EXCLUDE (false positives and non-urgent content)
const EXCLUDE_KEYWORDS = [
  'price war', 'trade war', 'streaming war', 'console war', 'browser war',
  'star wars', 'storage wars', 'bidding war', 'ratings war',
  'consumer price', 'oil price', 'stock price', 'house price',
  'ai model', 'artificial intelligence', 'machine learning', 'chatgpt', 'openai',
  'iphone', 'android', 'samsung', 'apple watch', 'macbook',
  'netflix', 'disney', 'spotify', 'streaming', 'box office',
  'crypto', 'bitcoin', 'ethereum', 'nft',
  'climate change', 'global warming', 'carbon',
  'sports', 'football', 'basketball', 'soccer', 'tennis', 'golf',
  'celebrity', 'entertainment', 'movie', 'film', 'album', 'concert',
  // Analysis/opinion pieces - not breaking news
  'analysis', 'opinion', 'editorial', 'commentary', 'perspective',
  'what we know', 'explainer', 'explained', 'why it matters',
  'could mean', 'may signal', 'might be', 'appears to',
  'what is', 'who is', 'who are', 'is it dead', 'how does', 'why does',
  'a look at', 'in depth', 'deep dive', 'long read', 'feature',
  // Local crime/accidents - NOT geopolitical
  'suspended sentence', 'driver who killed', 'drunk driver', 'dui',
  'car crash', 'traffic accident', 'road accident', 'vehicle crash',
  'house fire', 'apartment fire', 'building fire', 'residential fire',
  'stabbing', 'stabbed', 'robbery', 'burglary', 'theft', 'shoplifting',
  'domestic violence', 'assault charge', 'murder suspect', 'homicide',
  'drug bust', 'drug raid', 'overdose', 'fentanyl', 'opioid',
  'missing person', 'amber alert', 'silver alert', 'cold case',
  'power outage', 'water main', 'gas leak', 'utility',
  'school lockdown', 'bomb threat', 'suspicious package',
  'local court', 'county court', 'sentenced to', 'pleaded guilty',
  'concordbridge', 'local news', 'community news',
  // Natural disasters (not geopolitical)
  'bushfire', 'wildfire', 'forest fire', 'brush fire',
  'earthquake', 'tsunami', 'hurricane', 'tornado', 'cyclone', 'typhoon',
  'flood', 'flooding', 'landslide', 'avalanche', 'volcanic',
  // India local news (not geopolitical)
  'delhi court', 'lalu prasad', 'land-for-jobs', 'scam case',
  'rjd chief', 'bjp leader', 'congress leader', 'aap leader',
  'municipal', 'panchayat', 'gram sabha', 'lok sabha',
  'cricket', 'ipl', 'bcci',
  // Other local/domestic
  'city council', 'town hall', 'mayor', 'governor',
  'school board', 'zoning', 'property tax', 'local election',
  // Soft news
  'diplomat to direct', 'board of peace', 'mediterranean becoming',
  'cancer patients', 'waiting for treatment',
  'frustrations', 'challenges in 2026', 'futura doctrina',
  // Non-urgent
  'book review', 'interview with', 'profile of', 'history of',
  // Sports - exclude completely
  'soccer', 'football player', 'footballer', 'injured player', 'transfer',
  'premier league', 'champions league', 'world cup', 'nba', 'nfl', 'mlb',
  'olympics', 'athlete', 'coach', 'manager', 'stadium', 'match', 'game',
  'score', 'goal', 'win', 'lose', 'championship', 'tournament', 'league',
  'team', 'player injured', 'injury update', 'out for', 'sidelined',
  'liverpool', 'manchester', 'chelsea', 'arsenal', 'tottenham', 'barcelona',
  'real madrid', 'juventus', 'bayern', 'psg', 'martinelli', 'haaland',
  // Entertainment - exclude completely
  'golden globes', 'oscars', 'emmys', 'grammys', 'awards show', 'red carpet',
  'celebrity', 'actress', 'actor', 'hollywood', 'netflix', 'disney',
  'sarah jessica parker', 'helen mirren', 'taylor swift', 'beyonce',
  'kardashian', 'entertainment', 'movie premiere', 'tv show', 'series finale',
  'box office', 'streaming', 'album', 'concert', 'tour', 'music video',
  // News sources to filter
  'channelnewsasia.com/entertainment', 'abc.net.au/news/.*entertainment'
];

// Keywords that indicate URGENT/BREAKING news (must have at least one)
const URGENT_KEYWORDS = [
  'breaking', 'urgent', 'just in', 'developing',
  'killed', 'dead', 'dies', 'death toll',
  'attack', 'attacked', 'strikes', 'struck', 'hits',
  'missile', 'drone', 'bomb', 'explosion', 'blast',
  'shooting', 'shot', 'gunfire',
  'invasion', 'invade', 'offensive',
  'troops', 'military operation',
  'protest', 'protests', 'riot', 'riots', 'unrest',
  'raid', 'raids', 'arrest', 'arrested',
  'war', 'conflict', 'clashes',
  'emergency', 'crisis', 'catastrophe', 'disaster'
];

// Check if text is likely English (simple heuristic)
function isLikelyEnglish(text: string): boolean {
  if (!text) return false;
  // Check for common non-Latin characters
  const nonLatinPattern = /[\u0400-\u04FF\u0600-\u06FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/;
  if (nonLatinPattern.test(text)) return false;
  // Check for common English words
  const englishWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'has', 'have', 'will', 'with', 'from', 'this', 'that', 'was', 'were', 'been', 'being'];
  const lowerText = text.toLowerCase();
  const hasEnglishWords = englishWords.some(word => lowerText.includes(` ${word} `) || lowerText.startsWith(`${word} `));
  return hasEnglishWords || text.length < 20; // Short titles might not have common words
}

function determineSeverity(title: string): 'low' | 'medium' | 'high' | 'critical' {
  const lowerTitle = title.toLowerCase();
  
  if (KEYWORDS_HIGH_SEVERITY.some(kw => lowerTitle.includes(kw))) {
    if (lowerTitle.includes('breaking') || lowerTitle.includes('urgent')) {
      return 'critical';
    }
    return 'high';
  }
  
  if (KEYWORDS_MEDIUM_SEVERITY.some(kw => lowerTitle.includes(kw))) {
    return 'medium';
  }
  
  return 'low';
}

function extractCountry(title: string): string | undefined {
  // Country keywords with their canonical country name - ordered by specificity
  const countryPatterns: [RegExp, string][] = [
    // Specific demonyms and leaders first (most specific)
    [/\bfrench\b/i, 'France'],
    [/\bmacron\b/i, 'France'],
    [/\bgerman\b/i, 'Germany'],
    [/\bscholz\b/i, 'Germany'],
    [/\bbritish\b/i, 'UK'],
    [/\bstarmer\b/i, 'UK'],
    [/\bsunak\b/i, 'UK'],
    [/\bitalian\b/i, 'Italy'],
    [/\bmeloni\b/i, 'Italy'],
    [/\bspanish\b/i, 'Spain'],
    [/\bpolish\b/i, 'Poland'],
    [/\bukrainian\b/i, 'Ukraine'],
    [/\bzelensky\b/i, 'Ukraine'],
    [/\brussian\b/i, 'Russia'],
    [/\bputin\b/i, 'Russia'],
    [/\bchinese\b/i, 'China'],
    [/\bxi jinping\b/i, 'China'],
    [/\bisraeli\b/i, 'Israel'],
    [/\bnetanyahu\b/i, 'Israel'],
    [/\bpalestinian\b/i, 'Palestine'],
    [/\biranian\b/i, 'Iran'],
    [/\bkhamenei\b/i, 'Iran'],
    [/\bsyrian\b/i, 'Syria'],
    [/\bassad\b/i, 'Syria'],
    [/\bturkish\b/i, 'Turkey'],
    [/\berdogan\b/i, 'Turkey'],
    [/\bjapanese\b/i, 'Japan'],
    [/\bindian\b/i, 'India'],
    [/\bmodi\b/i, 'India'],
    [/\bkorean\b/i, 'South Korea'],
    [/\bkim jong\b/i, 'North Korea'],
    [/\bamerican\b/i, 'USA'],
    [/\btrump\b/i, 'USA'],
    [/\bbiden\b/i, 'USA'],
    // Then country names
    [/\bukraine\b/i, 'Ukraine'],
    [/\bkyiv\b/i, 'Ukraine'],
    [/\brussia\b/i, 'Russia'],
    [/\bmoscow\b/i, 'Russia'],
    [/\bkremlin\b/i, 'Russia'],
    [/\bchina\b/i, 'China'],
    [/\bbeijing\b/i, 'China'],
    [/\btaiwan\b/i, 'Taiwan'],
    [/\bisrael\b/i, 'Israel'],
    [/\btel aviv\b/i, 'Israel'],
    [/\bgaza\b/i, 'Gaza'],
    [/\bpalestine\b/i, 'Palestine'],
    [/\biran\b/i, 'Iran'],
    [/\btehran\b/i, 'Iran'],
    [/\bsyria\b/i, 'Syria'],
    [/\byemen\b/i, 'Yemen'],
    [/\bhouthi\b/i, 'Yemen'],
    [/\bsudan\b/i, 'Sudan'],
    [/\bmyanmar\b/i, 'Myanmar'],
    [/\bnorth korea\b/i, 'North Korea'],
    [/\bpyongyang\b/i, 'North Korea'],
    [/\bsouth korea\b/i, 'South Korea'],
    [/\bseoul\b/i, 'South Korea'],
    [/\bjapan\b/i, 'Japan'],
    [/\btokyo\b/i, 'Japan'],
    [/\bindia\b/i, 'India'],
    [/\bpakistan\b/i, 'Pakistan'],
    [/\bafghanistan\b/i, 'Afghanistan'],
    [/\btaliban\b/i, 'Afghanistan'],
    [/\biraq\b/i, 'Iraq'],
    [/\blebanon\b/i, 'Lebanon'],
    [/\bhezbollah\b/i, 'Lebanon'],
    [/\bturkey\b/i, 'Turkey'],
    [/\bfrance\b/i, 'France'],
    [/\bparis\b/i, 'France'],
    [/\bgermany\b/i, 'Germany'],
    [/\bberlin\b/i, 'Germany'],
    [/\bpoland\b/i, 'Poland'],
    [/\bwarsaw\b/i, 'Poland'],
    [/\bnato\b/i, 'NATO'],
    [/\beuropean union\b/i, 'EU'],
    [/\bbrussels\b/i, 'EU'],
    [/\buk\b/i, 'UK'],
    [/\blondon\b/i, 'UK'],
    [/\bmexico\b/i, 'Mexico'],
    [/\bvenezuela\b/i, 'Venezuela'],
    [/\bcuba\b/i, 'Cuba'],
    // USA last (least specific, often the source country)
    [/\busa\b/i, 'USA'],
    [/\bunited states\b/i, 'USA'],
    [/\bwashington\b/i, 'USA'],
    [/\bpentagon\b/i, 'USA'],
  ];
  
  for (const [pattern, country] of countryPatterns) {
    if (pattern.test(title)) {
      return country;
    }
  }
  return undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'all';

  // Return cached data if still valid
  if (newsCache && Date.now() - newsCache.timestamp < CACHE_TTL) {
    let items = newsCache.items;
    if (category !== 'all') {
      items = items.filter(item => item.category === category);
    }
    return NextResponse.json({
      items: items.slice(0, 50),
      timestamp: new Date().toISOString(),
      count: items.length,
      cached: true,
    });
  }

  try {
    const feedPromises = RSS_FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        return parsed.items.slice(0, 10).map((item, index) => {
          // Extract actual source from Google News titles (format: "Title - Source Name")
          let actualSource = feed.source;
          let cleanTitle = item.title || 'No title';
          
          if (feed.source === 'Breaking' && cleanTitle.includes(' - ')) {
            const parts = cleanTitle.split(' - ');
            if (parts.length >= 2) {
              actualSource = parts[parts.length - 1].trim();
              cleanTitle = parts.slice(0, -1).join(' - ').trim();
            }
          }
          
          return {
            id: `${feed.source}-${index}-${Date.now()}`,
            title: cleanTitle,
            link: item.link || '#',
            source: actualSource,
            category: feed.category,
            pubDate: item.pubDate || new Date().toISOString(),
            snippet: item.contentSnippet?.substring(0, 150),
            country: extractCountry(cleanTitle),
            severity: determineSeverity(cleanTitle),
          };
        });
      } catch (error) {
        console.error(`Failed to fetch ${feed.source}:`, error);
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    let allItems: NewsItem[] = results.flat();

    // Group similar articles instead of removing them
    const getWords = (title: string): Set<string> => {
      return new Set(
        title.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .split(/\s+/)
          .filter(w => w.length > 2)
      );
    };
    
    const similarity = (words1: Set<string>, words2: Set<string>): number => {
      if (words1.size === 0 || words2.size === 0) return 0;
      let intersection = 0;
      words1.forEach(w => { if (words2.has(w)) intersection++; });
      const union = words1.size + words2.size - intersection;
      return intersection / union;
    };
    
    // Group similar articles together
    const groupedItems: NewsItem[] = [];
    const usedIndices = new Set<number>();
    
    for (let i = 0; i < allItems.length; i++) {
      if (usedIndices.has(i)) continue;
      
      const mainItem = { ...allItems[i], relatedArticles: [] as RelatedArticle[] };
      const mainWords = getWords(mainItem.title);
      usedIndices.add(i);
      
      // Find similar articles from different sources
      for (let j = i + 1; j < allItems.length; j++) {
        if (usedIndices.has(j)) continue;
        
        const otherItem = allItems[j];
        const otherWords = getWords(otherItem.title);
        
        if (similarity(mainWords, otherWords) > 0.25 && otherItem.source !== mainItem.source) {
          mainItem.relatedArticles.push({
            title: otherItem.title,
            link: otherItem.link,
            source: otherItem.source,
            pubDate: otherItem.pubDate,
          });
          usedIndices.add(j);
        }
      }
      
      groupedItems.push(mainItem);
    }
    
    allItems = groupedItems;

    // Filter out excluded content (price wars, AI, entertainment, etc.)
    const shouldExclude = (title: string) => {
      const lower = title.toLowerCase();
      return EXCLUDE_KEYWORDS.some(kw => lower.includes(kw));
    };

    // Check if item is priority (geopolitical/military)
    const isPriority = (title: string) => {
      const lower = title.toLowerCase();
      return PRIORITY_KEYWORDS.some(kw => lower.includes(kw));
    };

    // Check if urgent (must have urgent keyword)
    const isUrgent = (title: string) => {
      const lower = title.toLowerCase();
      return URGENT_KEYWORDS.some(kw => lower.includes(kw));
    };

    // Filter: STRICT - must have urgent keyword AND priority keyword
    allItems = allItems.filter(item => {
      // Must be English
      if (!isLikelyEnglish(item.title)) return false;
      // Exclude non-conflict content by title
      if (shouldExclude(item.title)) return false;
      // Exclude entertainment/sports URLs
      const url = (item.link || '').toLowerCase();
      if (url.includes('/entertainment') || url.includes('/sport') || url.includes('/lifestyle')) return false;
      // MUST have urgent keyword - this is the key filter
      if (!isUrgent(item.title)) return false;
      // Also must match priority keywords
      return isPriority(item.title) || item.severity === 'critical' || item.severity === 'high';
    });

    // Filter by category if specified
    if (category !== 'all') {
      allItems = allItems.filter(item => item.category === category);
    }

    // Sort: strictly chronological - newest first
    allItems.sort((a, b) => {
      const aTime = new Date(a.pubDate).getTime();
      const bTime = new Date(b.pubDate).getTime();
      return bTime - aTime; // Newest first
    });

    // Update cache
    newsCache = {
      items: allItems,
      timestamp: Date.now(),
    };

    return NextResponse.json({
      items: allItems.slice(0, 50),
      timestamp: new Date().toISOString(),
      count: allItems.length,
      cached: false,
    });
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news', items: [] },
      { status: 500 }
    );
  }
}
