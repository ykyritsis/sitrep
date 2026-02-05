'use client';

import { useState } from 'react';
import { Send, Terminal } from 'lucide-react';

interface CommandInputProps {
  onCommand?: (command: string) => void;
}

export default function CommandInput({ onCommand }: CommandInputProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    'SYS: SECURE CONNECTION ESTABLISHED.',
    'AI: Awaiting instructions. I can analyze global threat vectors or filter intercepts by region.',
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const command = input.trim();
    setHistory((prev) => [...prev, `> ${command}`]);
    
    // Simulate AI response
    setTimeout(() => {
      let response = 'Command acknowledged. Processing...';
      
      if (command.toLowerCase().includes('ukraine')) {
        response = 'AI: Ukraine situation - Active conflict zones in Donetsk, Luhansk, and Zaporizhzhia oblasts. 47 incidents reported in last 24h.';
      } else if (command.toLowerCase().includes('taiwan')) {
        response = 'AI: Taiwan Strait - Elevated naval activity detected. 12 PLAN vessels in vicinity. No immediate escalation indicators.';
      } else if (command.toLowerCase().includes('threat')) {
        response = 'AI: Current global threat level: ELEVATED. Primary concerns: Eastern Europe, Middle East, Korean Peninsula.';
      } else if (command.toLowerCase().includes('help')) {
        response = 'AI: Available commands: status, threat, [region name], filter [category], export, clear';
      }
      
      setHistory((prev) => [...prev, response]);
    }, 500);

    if (onCommand) onCommand(command);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col terminal-border bg-black/50">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#00ff41]/20">
        <Terminal className="w-4 h-4 text-[#00ff41]" />
        <span className="text-[#00ff41] text-xs font-bold tracking-wider">AI ANALYST UPLINK</span>
        <span className="ml-auto text-[#00ff41] text-xs">ONLINE</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1">
        {history.map((line, i) => (
          <div
            key={i}
            className={`${
              line.startsWith('>')
                ? 'text-[#00d4ff]'
                : line.startsWith('SYS:')
                ? 'text-[#ffcc00]'
                : line.startsWith('AI:')
                ? 'text-gray-300'
                : 'text-[#00ff41]'
            }`}
          >
            {line}
          </div>
        ))}
        <span className="animate-blink text-[#00ff41]">_</span>
      </div>

      <form onSubmit={handleSubmit} className="border-t border-[#00ff41]/20">
        <div className="flex items-center gap-2 p-2">
          <span className="text-[#00ff41] text-xs">{'>'}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ENTER COMMAND..."
            className="flex-1 bg-transparent text-[#00ff41] text-xs outline-none placeholder:text-[#00ff41]/30"
          />
          <button
            type="submit"
            className="text-[#00ff41]/70 hover:text-[#00ff41] transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
