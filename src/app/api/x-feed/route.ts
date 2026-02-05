import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
});

// Telegram channels for OSINT - these are reliable and fast
const TELEGRAM_CHANNELS = [
  { id: 'inikiforov', name: 'Intel Slava Z', color: '#ef4444' },
  { id: 'ryaborig', name: 'Rybar', color: '#f97316' },
  { id: 'warmonitors', name: 'War Monitor', color: '#dc2626' },
  { id: 'osaborig', name: 'OSINT Aggregator', color: '#22c55e' },
  { id: 'V4Visegrad', name: 'Visegrad 24', color: '#3b82f6' },
  { id: 'polyaborig', name: 'Polymarket News', color: '#8b5cf6' },
];

interface TelegramPost {
  id: string;
  channel: string;
  channelName: string;
  content: string;
  timestamp: Date;
  link: string;
  color: string;
}

// Cache to avoid hammering RSSHub
let cache: { posts: TelegramPost[]; timestamp: number } | null = null;
const CACHE_TTL = 60000; // 1 minute cache

// Multiple RSS sources to try for Telegram
const TELEGRAM_RSS_SOURCES = [
  (id: string) => `https://tg.i-c-a.su/rss/${id}`,
  (id: string) => `https://rsshub.app/telegram/channel/${id}`,
];

async function fetchFromTelegram(channel: { id: string; name: string; color: string }): Promise<TelegramPost[]> {
  const posts: TelegramPost[] = [];
  
  for (const getUrl of TELEGRAM_RSS_SOURCES) {
    try {
      const url = getUrl(channel.id);
      const feed = await parser.parseURL(url);
      
      for (const item of feed.items.slice(0, 5)) {
        let content = item.content || item.contentSnippet || item.title || '';
        content = content.replace(/<[^>]*>/g, '').trim();
        
        if (content.length < 10) continue;
        
        posts.push({
          id: `${channel.id}-${item.guid || Date.now()}-${Math.random()}`,
          channel: channel.id,
          channelName: channel.name,
          content: content.substring(0, 300),
          timestamp: new Date(item.pubDate || Date.now()),
          link: item.link || `https://t.me/${channel.id}`,
          color: channel.color,
        });
      }
      
      if (posts.length > 0) break; // Success, stop trying other sources
      
    } catch (error) {
      continue; // Try next source
    }
  }
  
  return posts;
}

export async function GET() {
  // Return cached data if still valid
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json({
      posts: cache.posts,
      cached: true,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const allPosts: TelegramPost[] = [];
    
    // Fetch from all Telegram channels in parallel
    const results = await Promise.allSettled(
      TELEGRAM_CHANNELS.map(channel => fetchFromTelegram(channel))
    );
    
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allPosts.push(...result.value);
      }
    }
    
    // Sort by timestamp (newest first)
    allPosts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Limit to 25 posts
    const posts = allPosts.slice(0, 25);
    
    // Update cache
    cache = { posts, timestamp: Date.now() };
    
    if (posts.length === 0) {
      return NextResponse.json({
        posts: [],
        error: 'No posts available. RSSHub may be down.',
        timestamp: new Date().toISOString(),
      });
    }
    
    return NextResponse.json({
      posts,
      timestamp: new Date().toISOString(),
      count: posts.length,
    });
    
  } catch (error) {
    console.error('Telegram Feed error:', error);
    return NextResponse.json({
      posts: [],
      error: 'Failed to fetch Telegram feed',
      timestamp: new Date().toISOString(),
    });
  }
}
