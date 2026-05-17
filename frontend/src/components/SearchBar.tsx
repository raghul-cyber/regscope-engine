'use client';

import { useState } from 'react';
import { SearchResult } from '@/lib/types';
import { searchClauses } from '@/lib/api';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    const data = await searchClauses(query);
    setResults(data);
    setLoading(false);
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: '2rem' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search regulatory clauses (e.g. cross-border transfer)..."
          style={{
            width: '100%',
            padding: '1.2rem 1.5rem',
            background: 'var(--surface)',
            border: '2px solid var(--border)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '1.1rem',
            outline: 'none',
            transition: 'border-color 0.3s'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        />
        <button
          type="submit"
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'var(--primary)',
            color: '#000',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {loading ? '...' : 'Search'}
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {results.map((res) => (
          <div key={res.id} className="glass-card animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ 
                background: 'var(--primary-glow)', 
                color: 'var(--primary)', 
                padding: '0.2rem 0.6rem', 
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {res.pillar.toUpperCase()}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Match: {(res.score * 100).toFixed(1)}%
              </span>
            </div>
            <p style={{ fontSize: '1.05rem', marginBottom: '1.5rem' }}>{res.text}</p>
            <div style={{ 
              padding: '1rem', 
              background: 'rgba(0,0,0,0.2)', 
              borderRadius: '8px', 
              borderLeft: '4px solid var(--secondary)'
            }}>
              <span style={{ color: 'var(--secondary)', fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>
                VERBATIM CITATION
              </span>
              <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                "{res.verbatim}..."
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
