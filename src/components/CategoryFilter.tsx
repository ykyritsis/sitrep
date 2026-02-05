'use client';

import { CATEGORIES } from '@/lib/constants';

interface CategoryFilterProps {
  selected: string;
  onChange: (category: string) => void;
  counts?: Record<string, number>;
}

export default function CategoryFilter({ selected, onChange, counts = {} }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 px-6 py-3 bg-slate-800 border-t border-slate-700 overflow-x-auto">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`px-4 py-2 text-xs font-bold tracking-wide whitespace-nowrap transition-all rounded-lg ${
            selected === cat.id
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 border border-transparent hover:bg-slate-700 hover:text-slate-200'
          }`}
        >
          {cat.name}
          {counts[cat.id] !== undefined && (
            <span className="ml-2 text-slate-500">{counts[cat.id]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
