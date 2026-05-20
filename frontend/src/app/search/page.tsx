"use client";
import React, { useState } from 'react';
import { searchClauses } from '../../lib/api';
import { SearchResult } from '../../lib/types';
import { ClauseCard, Loader, EmptyState, PageHeader } from '../../components/Shared';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [jurisdictions, setJurisdictions] = useState<string[]>([]);
  const [pillars, setPillars] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleItem = (arr: string[], set: React.Dispatch<React.SetStateAction<string[]>>, val: string) =>
    set(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchClauses(query, jurisdictions, pillars);
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  const JURISDICTIONS = [{ code: 'IN', label: 'India (DPDP)' }, { code: 'SG', label: 'Singapore (PDPA)' }, { code: 'EU', label: 'EU (GDPR)' }];
  const PILLARS = [{ code: 'pillar_6', label: 'Pillar 6 — Cross-Border Transfer' }, { code: 'pillar_7', label: 'Pillar 7 — Security Safeguards' }];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Semantic Search" subtitle="AI vector search across all indexed compliance clauses" />

      <div className="card space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
            <input
              type="text"
              className="input pl-10"
              placeholder="Search concepts (e.g. cross-border transfer adequacy)…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`btn btn-secondary ${showFilters ? 'border-[var(--blue-500)] text-[var(--blue-400)]' : ''}`}
          >
            <SlidersHorizontal size={15} />
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border-base)] animate-fade-in">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-faint)] mb-3">Jurisdiction</p>
              <div className="flex flex-wrap gap-2">
                {JURISDICTIONS.map(j => (
                  <button
                    key={j.code}
                    type="button"
                    onClick={() => toggleItem(jurisdictions, setJurisdictions, j.code)}
                    className={`btn btn-sm ${jurisdictions.includes(j.code) ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {j.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-faint)] mb-3">Pillar</p>
              <div className="flex flex-wrap gap-2">
                {PILLARS.map(p => (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => toggleItem(pillars, setPillars, p.code)}
                    className={`btn btn-sm ${pillars.includes(p.code) ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20"><Loader size="lg" text="Running neural embedding match…" /></div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{results.length} results</p>
          </div>
          {results.map((r, i) => {
            const pct = Math.round(r.score * 100);
            const scoreClass = pct >= 85 ? 'badge-green' : pct >= 70 ? 'badge-amber' : 'badge-red';
            return (
              <div key={r.clause?.id || i} className="flex gap-4 items-start animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={`shrink-0 badge ${scoreClass} flex-col items-center py-2.5 px-3 gap-0 text-lg font-black`}>
                  {pct}%
                </div>
                <div className="flex-1 min-w-0">
                  <ClauseCard clause={r.clause} />
                </div>
              </div>
            );
          })}
        </div>
      ) : searched ? (
        <EmptyState icon="📭" title="No matches found" description="Try broader search terms or remove filters to expand results." />
      ) : (
        <EmptyState icon="🔍" title="Ready to search" description="Enter a regulatory concept above to query the vector store." />
      )}
    </div>
  );
}
