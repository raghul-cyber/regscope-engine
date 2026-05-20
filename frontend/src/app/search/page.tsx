"use client";
import React, { useState } from 'react';
import { ClauseCard } from '../../components/Shared';
import { searchClauses } from '../../lib/api';
import { SearchResult } from '../../lib/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<string[]>([]);
  const [selectedPillars, setSelectedPillars] = useState<string[]>([]);
  const [searched, setSearched] = useState(false);

  const handleJurisdictionChange = (code: string) => {
    setSelectedJurisdictions(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handlePillarChange = (pillar: string) => {
    setSelectedPillars(prev => 
      prev.includes(pillar) ? prev.filter(p => p !== pillar) : [...prev, pillar]
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await searchClauses(query, selectedJurisdictions, selectedPillars);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#c9d1d9] to-[#8b949e] bg-clip-text text-transparent">
          Semantic Search
        </h1>
        <p className="text-[#8b949e] mt-2">
          Query cross-border compliance databases using AI-powered embedding matching.
        </p>
      </div>
      
      <form onSubmit={handleSearch} className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xl pointer-events-none">🔍</span>
            <input 
              type="text" 
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pl-12 pr-4 py-4 text-white placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all duration-200"
              placeholder="Search concepts (e.g., cross border transfer adequacy, security safeguards)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#58a6ff] hover:bg-[#58a6ff]/90 disabled:opacity-50 disabled:hover:bg-[#58a6ff] text-slate-950 font-bold px-8 py-4 rounded-xl shadow-lg shadow-[#58a6ff]/20 hover:shadow-[#58a6ff]/30 transition-all duration-200"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#30363d]/60">
          <div>
            <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-3">Filter by Jurisdiction</h3>
            <div className="flex flex-wrap gap-4">
              {[
                { code: 'IN', label: 'India (DPDP 2023)' },
                { code: 'SG', label: 'Singapore (PDPA)' },
                { code: 'EU', label: 'EU (GDPR)' }
              ].map(j => (
                <label key={j.code} className="flex items-center gap-2 text-sm text-[#c9d1d9] cursor-pointer hover:text-white select-none">
                  <input 
                    type="checkbox" 
                    className="rounded border-[#30363d] bg-[#0d1117] text-[#58a6ff] focus:ring-0 focus:ring-offset-0 w-4 h-4" 
                    checked={selectedJurisdictions.includes(j.code)}
                    onChange={() => handleJurisdictionChange(j.code)}
                  /> 
                  {j.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-3">Filter by Compliance Pillar</h3>
            <div className="flex flex-wrap gap-4">
              {[
                { code: 'pillar_6', label: 'Pillar 6 (Cross-Border Transfer)' },
                { code: 'pillar_7', label: 'Pillar 7 (Data Protection & Security)' }
              ].map(p => (
                <label key={p.code} className="flex items-center gap-2 text-sm text-[#c9d1d9] cursor-pointer hover:text-white select-none">
                  <input 
                    type="checkbox" 
                    className="rounded border-[#30363d] bg-[#0d1117] text-[#58a6ff] focus:ring-0 focus:ring-offset-0 w-4 h-4" 
                    checked={selectedPillars.includes(p.code)}
                    onChange={() => handlePillarChange(p.code)}
                  /> 
                  {p.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </form>

      {/* Results Container */}
      <div className="space-y-6">
        {searched && (
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Search Results
            </h2>
            <span className="text-sm text-[#8b949e] bg-[#161b22] px-3 py-1.5 rounded-full border border-[#30363d]">
              {results.length} matched clauses
            </span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#8b949e]">Performing neural embedding match...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {results.map((r, i) => {
              const scorePercent = (r.score * 100).toFixed(0);
              let scoreColor = 'text-[#7ee787] border-[#7ee787]/30 bg-[#7ee787]/5';
              if (r.score < 0.7) {
                scoreColor = 'text-[#f85149] border-[#f85149]/30 bg-[#f85149]/5';
              } else if (r.score < 0.85) {
                scoreColor = 'text-[#d29922] border-[#d29922]/30 bg-[#d29922]/5';
              }

              return (
                <div key={r.clause.id || i} className="flex flex-col sm:flex-row gap-4 items-start bg-[#161b22]/40 border border-[#30363d]/50 p-6 rounded-2xl hover:border-[#58a6ff]/40 transition-all duration-200">
                  <div className={`shrink-0 w-16 h-16 rounded-xl border flex flex-col items-center justify-center ${scoreColor}`}>
                    <span className="text-xs uppercase tracking-wider font-semibold opacity-80">Match</span>
                    <span className="text-lg font-bold">{scorePercent}%</span>
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <ClauseCard clause={r.clause} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : searched ? (
          <div className="bg-[#161b22]/50 border border-[#30363d]/60 rounded-2xl py-16 text-center">
            <span className="text-4xl">📭</span>
            <h3 className="mt-4 text-lg font-semibold text-white">No matches found</h3>
            <p className="text-[#8b949e] mt-1 max-w-md mx-auto text-sm">
              Try adjusting your search terms or selecting fewer filters.
            </p>
          </div>
        ) : (
          <div className="bg-[#161b22]/20 border border-[#30363d]/30 border-dashed rounded-2xl py-16 text-center">
            <span className="text-4xl opacity-50">🤖</span>
            <h3 className="mt-4 text-lg font-semibold text-[#8b949e]">Awaiting input</h3>
            <p className="text-[#8b949e]/60 mt-1 max-w-sm mx-auto text-sm">
              Type a compliance concept above to query the vector store.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
