'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Radio, ExternalLink, RefreshCw } from 'lucide-react';

interface OSINTPost {
  id: string;
  author: string;
  handle: string;
  content: string;
  snippet?: string;
  timestamp: string;
  link?: string;
  verified: boolean;
}

export default function OSINTFeed() {
  const [posts, setPosts] = useState<OSINTPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOSINT = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/osint');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPosts(data.posts || []);
      setError(null);
    } catch (err) {
      setError('Failed to connect');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOSINT();
    const interval = setInterval(fetchOSINT, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="card-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-purple-400" />
          <span className="text-slate-200 text-xs font-bold tracking-wide">OSINT</span>
        </div>
        <button 
          onClick={fetchOSINT} 
          className="text-slate-500 hover:text-slate-300 transition-colors p-1 hover:bg-slate-700 rounded"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {error && <div className="p-4 text-red-400 text-sm bg-red-500/10">{error}</div>}
        
        {loading && posts.length === 0 ? (
          <div className="p-4 text-slate-400 text-sm">Connecting to sources...</div>
        ) : (
          <div>
            {posts.map((post) => (
              <a
                key={post.id}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="feed-item block"
              >
                {/* Source Row */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="source-tag" style={{ backgroundColor: 'rgba(168, 85, 247, 0.12)', color: '#a78bfa' }}>
                    {post.author}
                  </span>
                  {post.verified && <CheckCircle className="w-3 h-3 text-purple-400" />}
                  <ExternalLink className="w-3 h-3 text-slate-600 ml-auto" />
                </div>

                {/* Content */}
                <p className="text-[11px] text-slate-300 leading-snug mb-1 line-clamp-2">
                  {post.content}
                </p>

                {/* Timestamp */}
                <span className="text-[10px] text-slate-500">
                  {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
