'use client';

import { useState, useEffect } from 'react';
import { Send, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

interface TelegramPost {
  id: string;
  channel: string;
  channelName: string;
  content: string;
  timestamp: string;
  link: string;
  color: string;
}

const TELEGRAM_CHANNELS = [
  { id: 'inikiforov', name: 'Intel Slava Z', color: '#ef4444' },
  { id: 'ryaborig', name: 'Rybar', color: '#f97316' },
  { id: 'warmonitors', name: 'War Monitor', color: '#dc2626' },
  { id: 'V4Visegrad', name: 'Visegrad 24', color: '#3b82f6' },
];

export default function TelegramFeed() {
  const [posts, setPosts] = useState<TelegramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/x-feed');
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setPosts(data.posts || []);
        setLastUpdate(new Date());
      }
    } catch (err) {
      setError('Failed to fetch Telegram feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 120000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/50">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-sky-400" />
          <span className="text-[10px] text-sky-400 font-bold tracking-widest">TELEGRAM OSINT</span>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <span className="text-[8px] text-slate-500">
              {formatTime(lastUpdate.toISOString())}
            </span>
          )}
          <button
            onClick={fetchPosts}
            disabled={loading}
            className="p-1 hover:bg-slate-700/50 rounded transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3 h-3 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tracked Channels */}
      <div className="flex gap-1 p-2 border-b border-slate-700/50 flex-shrink-0 overflow-x-auto">
        {TELEGRAM_CHANNELS.map((channel) => (
          <a
            key={channel.id}
            href={`https://t.me/${channel.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold whitespace-nowrap hover:opacity-80 transition-opacity"
            style={{ backgroundColor: `${channel.color}20`, color: channel.color }}
          >
            {channel.name}
          </a>
        ))}
      </div>

      {/* Feed Content */}
      <div className="flex-1 overflow-y-auto">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <AlertCircle className="w-6 h-6 text-amber-400 mb-2" />
            <p className="text-[10px] text-slate-400 mb-2">{error}</p>
            <p className="text-[9px] text-slate-500">
              RSSHub may be rate-limited. Try again later.
            </p>
          </div>
        ) : loading && posts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="w-5 h-5 text-slate-500 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <Send className="w-6 h-6 text-slate-600 mb-2" />
            <p className="text-[10px] text-slate-500">No posts available</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/30">
            {posts.map((post) => (
              <a
                key={post.id}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[9px] font-bold"
                    style={{ color: post.color }}
                  >
                    {post.channelName}
                  </span>
                  <span className="text-[8px] text-slate-500">
                    {formatTime(post.timestamp)}
                  </span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-600 ml-auto" />
                </div>
                <p className="text-[10px] text-slate-300 line-clamp-3">
                  {post.content}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
