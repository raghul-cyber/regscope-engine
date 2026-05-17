"use client";
import React, { useState } from 'react';
import { ClauseCard } from '../../components/Shared';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock API response
    setResults([
      {
        score: 0.92,
        clause: {
          id: '1',
          raw_text: 'Personal data shall not be transferred to a country or territory outside Singapore except in accordance with the requirements prescribed under this Act.',
          pillar: 'pillar_6',
          clause_type: 'prohibition',
          topics: ['cross_border_transfer'],
          confidence: 0.98,
        }
      }
    ]);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-100">Semantic Search</h1>
      
      <form onSubmit={handleSearch} className="mb-12">
        <div className="flex gap-4">
          <input 
            type="text" 
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-6 py-4 text-lg text-slate-100 focus:outline-none focus:border-blue-500"
            placeholder="Search regulatory concepts (e.g., cross border transfer adequacy)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-lg font-bold text-lg">
            Search
          </button>
        </div>
        <div className="flex gap-6 mt-4">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input type="checkbox" className="rounded bg-slate-800 border-slate-600" /> India
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input type="checkbox" className="rounded bg-slate-800 border-slate-600" /> Singapore
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input type="checkbox" className="rounded bg-slate-800 border-slate-600" /> EU
          </label>
        </div>
      </form>

      <div className="space-y-4">
        {results.map((r, i) => (
          <div key={i} className="flex gap-4 items-start">
            <div className="shrink-0 w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-900 text-sm font-bold text-blue-400" title="Relevance Score">
              {(r.score * 100).toFixed(0)}
            </div>
            <div className="flex-1">
              <ClauseCard clause={r.clause} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
