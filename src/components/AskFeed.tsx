'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface Source { title: string; source: string; link: string }
interface AskResult { answer: string; sources: Source[] }

const EXAMPLES = ['What is happening in Ukraine?', 'Any news on Iran today?', 'What is NATO discussing?'];

export default function AskFeed() {
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AskResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ask = async (text: string) => {
    const q = text.trim();
    if (q.length < 3 || busy) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Could not get an answer.');
      else setResult(data as AskResult);
    } catch {
      setError('Could not reach the answer service.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="ask-card" aria-labelledby="ask-title">
      <h2 id="ask-title" className="ask-title"><Sparkles size={14} aria-hidden="true" /> Ask the feed</h2>

      <form className="ask-form" onSubmit={(e) => { e.preventDefault(); ask(question); }}>
        <input
          aria-label="Ask a question about today's headlines"
          placeholder="Ask about today's headlines…"
          value={question}
          maxLength={200}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button type="submit" disabled={busy || question.trim().length < 3} aria-label="Ask">
          <ArrowRight size={15} />
        </button>
      </form>

      {!result && !busy && !error && (
        <div className="ask-examples">
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" onClick={() => { setQuestion(ex); ask(ex); }}>{ex}</button>
          ))}
        </div>
      )}

      {busy && <p className="ask-status">Reading the current headlines…</p>}
      {error && <p className="ask-error" role="status">{error}</p>}

      {result && (
        <div className="ask-answer">
          <p>{result.answer}</p>
          {result.sources.length > 0 && (
            <p className="ask-sources">
              {result.sources.map((s, i) => (
                <span key={i}>
                  {i > 0 && ' · '}
                  <a href={s.link} target="_blank" rel="noopener noreferrer">{s.source}</a>
                </span>
              ))}
            </p>
          )}
          <p className="ask-note">Answered from the headlines currently shown. Check the sources.</p>
        </div>
      )}
    </section>
  );
}
