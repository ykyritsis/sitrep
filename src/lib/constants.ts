export const NEWS_SOURCES = {
  reuters: {
    name: 'Reuters',
    rss: 'https://feeds.reuters.com/reuters/worldNews',
    category: 'world'
  },
  guardian: {
    name: 'The Guardian',
    rss: 'https://www.theguardian.com/world/rss',
    category: 'world'
  },
  bbc: {
    name: 'BBC World',
    rss: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'world'
  },
  aljazeera: {
    name: 'Al Jazeera',
    rss: 'https://www.aljazeera.com/xml/rss/all.xml',
    category: 'world'
  },
  rt: {
    name: 'RT News',
    rss: 'https://www.rt.com/rss/news/',
    category: 'world'
  }
} as const;

export const HOTSPOTS: Array<{
  id: string;
  name: string;
  lat: number;
  lng: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'conflict' | 'breaking' | 'nuclear' | 'economic' | 'cyber';
  description: string;
}> = [
  { id: '1', name: 'UKRAINE CONFLICT', lat: 48.3794, lng: 31.1656, severity: 'critical', type: 'conflict', description: 'Active military operations' },
  { id: '2', name: 'TAIWAN STRAIT', lat: 23.5, lng: 121, severity: 'high', type: 'conflict', description: 'Elevated military activity' },
  { id: '3', name: 'GAZA', lat: 31.3547, lng: 34.3088, severity: 'critical', type: 'conflict', description: 'Ongoing humanitarian crisis' },
  { id: '4', name: 'SUDAN CIVIL WAR', lat: 12.8628, lng: 30.2176, severity: 'high', type: 'conflict', description: 'Civil conflict ongoing' },
  { id: '5', name: 'STRAIT OF HORMUZ', lat: 26.5667, lng: 56.25, severity: 'medium', type: 'economic', description: 'Strategic chokepoint monitoring' },
  { id: '6', name: 'SOUTH CHINA SEA', lat: 12, lng: 114, severity: 'medium', type: 'conflict', description: 'Territorial disputes' },
  { id: '7', name: 'NORTH KOREA', lat: 40.3399, lng: 127.5101, severity: 'high', type: 'nuclear', description: 'Nuclear program activity' },
  { id: '8', name: 'IRAN', lat: 32.4279, lng: 53.688, severity: 'high', type: 'nuclear', description: 'Nuclear negotiations' },
  { id: '9', name: 'MYANMAR', lat: 21.9162, lng: 95.956, severity: 'medium', type: 'conflict', description: 'Civil unrest' },
  { id: '10', name: 'SAHEL REGION', lat: 15, lng: 0, severity: 'medium', type: 'conflict', description: 'Insurgency activity' },
];

export const OSINT_ACCOUNTS = [
  { handle: '@WarMonitor', name: 'War Monitor', verified: true },
  { handle: '@IntelCrab', name: 'Intel Crab', verified: true },
  { handle: '@OSINTdefender', name: 'OSINT Defender', verified: true },
  { handle: '@sentdefender', name: 'Sentdefender', verified: true },
  { handle: '@TheIntelFrog', name: 'The Intel Frog', verified: true },
];

export const CATEGORIES = [
  { id: 'all', name: 'ALL', color: '#00ff41' },
  { id: 'geopolitical', name: 'WORLD / GEOPOLITICAL', color: '#ff6b35' },
  { id: 'technology', name: 'TECHNOLOGY / AI', color: '#00d4ff' },
  { id: 'financial', name: 'FINANCIAL', color: '#ffcc00' },
  { id: 'military', name: 'MILITARY', color: '#ff0040' },
];
