'use client';

import { ExternalLink } from 'lucide-react';

interface PopoutButtonProps {
  panel: 'globe' | 'intel' | 'markets';
  className?: string;
}

export default function PopoutButton({ panel, className = '' }: PopoutButtonProps) {
  const handlePopout = () => {
    const width = panel === 'globe' ? 1200 : 500;
    const height = panel === 'globe' ? 800 : 700;
    const left = window.screenX + 50;
    const top = window.screenY + 50;
    
    window.open(
      `/popout/${panel}`,
      `sitrep-${panel}`,
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
    );
  };

  return (
    <button
      onClick={handlePopout}
      className={`p-1 hover:bg-slate-700/50 rounded transition-colors group ${className}`}
      title={`Pop out to new window`}
    >
      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
    </button>
  );
}
