'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Zap, Globe2 } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'news' | 'market' | 'alert' | 'event';
  message: string;
  timestamp: Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export default function ActivityTicker() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Fetch initial activities
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/news?limit=10');
        const data = await response.json();
        
        const newsActivities: ActivityItem[] = (data.items || []).slice(0, 10).map((item: any, index: number) => ({
          id: `news-${index}`,
          type: 'news' as const,
          message: item.title,
          timestamp: new Date(item.pubDate),
          severity: item.severity,
        }));
        
        setActivities(newsActivities);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 60000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string, severity?: string) => {
    if (severity === 'critical') return <AlertTriangle className="w-3 h-3 text-red-400" />;
    if (severity === 'high') return <Zap className="w-3 h-3 text-orange-400" />;
    if (type === 'event') return <Globe2 className="w-3 h-3 text-blue-400" />;
    return <Clock className="w-3 h-3 text-slate-400" />;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (activities.length === 0) return null;

  return (
    <div className={`fixed bottom-12 left-0 right-0 z-20 transition-all duration-300 ${isExpanded ? 'h-48' : 'h-8'}`}>
      {/* Expanded View */}
      {isExpanded && (
        <div className="h-40 bg-slate-900/95 border-t border-slate-700 overflow-y-auto backdrop-blur-sm">
          <div className="p-2 space-y-1">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-2 p-2 rounded bg-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                {getIcon(activity.type, activity.severity)}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-300 truncate">{activity.message}</p>
                </div>
                <span className="text-[8px] text-slate-500 flex-shrink-0">{formatTime(activity.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Ticker Bar */}
      <div 
        className="h-8 bg-slate-900/90 border-t border-slate-700 flex items-center cursor-pointer backdrop-blur-sm"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 px-3 border-r border-slate-700 h-full">
          <Clock className="w-3 h-3 text-amber-400" />
          <span className="text-[9px] text-amber-400 font-bold">ACTIVITY</span>
        </div>
        
        {/* Scrolling Ticker */}
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-ticker flex items-center gap-8 whitespace-nowrap">
            {activities.slice(0, 5).map((activity, index) => (
              <div key={activity.id} className="flex items-center gap-2">
                {getIcon(activity.type, activity.severity)}
                <span className="text-[10px] text-slate-300">{activity.message.substring(0, 60)}...</span>
                <span className="text-[8px] text-slate-500">{formatTime(activity.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="px-3 text-[8px] text-slate-500">
          {isExpanded ? '▼ COLLAPSE' : '▲ EXPAND'}
        </div>
      </div>
    </div>
  );
}
