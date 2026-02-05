export interface RelatedArticle {
  title: string;
  link: string;
  source: string;
  pubDate: string;
}

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  category: string;
  pubDate: string;
  snippet?: string;
  country?: string;
  coordinates?: [number, number];
  severity?: 'low' | 'medium' | 'high' | 'critical';
  relatedArticles?: RelatedArticle[];
}

export interface HotspotData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'conflict' | 'breaking' | 'nuclear' | 'economic' | 'cyber';
  description: string;
  newsCount: number;
}

export interface MarketData {
  id: string;
  question: string;
  probability: number;
  volume: number;
  category: string;
}

export interface OSINTPost {
  id: string;
  author: string;
  handle: string;
  content: string;
  timestamp: string;
  source: 'twitter' | 'telegram' | 'other';
  verified: boolean;
}

export type ThreatLevel = 'LOW' | 'GUARDED' | 'ELEVATED' | 'HIGH' | 'SEVERE';

export interface SystemStatus {
  threatLevel: ThreatLevel;
  activeRegions: number;
  lastUpdate: string;
  uplink: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
}
