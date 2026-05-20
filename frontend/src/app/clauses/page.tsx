"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { ClauseCard } from '../../components/Shared';
import { getClauses } from '../../lib/api';
import { Clause } from '../../lib/types';

export default function ClausesPage() {
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);

  // Filters
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('');
  const [selectedPillar, setSelectedPillar] = useState<string>('');

  const fetchClausesData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClauses({
        jurisdiction: selectedJurisdiction || undefined,
        pillar: selectedPillar || undefined,
        page,
        pageSize,
      });
      setClauses(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error in Clause Browser:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedJurisdiction, selectedPillar, page, pageSize]);

  useEffect(() => {
    fetchClausesData();
  }, [fetchClausesData]);

  // Reset page when filters change
  const handleJurisdictionFilter = (code: string) => {
    setSelectedJurisdiction(code);
    setPage(1);
  };

  const handlePillarFilter = (pillar: string) => {
    setSelectedPillar(pillar);
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#c9d1d9] to-[#8b949e] bg-clip-text text-transparent">
          Clause Browser
        </h1>
        <p className="text-[#8b949e] mt-2">
          Navigate and inspect extracted regulatory clauses and verification mappings.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6 bg-[#161b22] border border-[#30363d] p-6 rounded-2xl h-fit">
          <div>
            <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-4">Jurisdiction</h3>
            <div className="flex flex-col gap-2">
              {[
                { code: '', label: 'All Jurisdictions' },
                { code: 'IN', label: 'India (DPDP 2023)' },
                { code: 'SG', label: 'Singapore (PDPA)' },
                { code: 'EU', label: 'EU (GDPR)' }
              ].map(j => (
                <button
                  key={j.code}
                  onClick={() => handleJurisdictionFilter(j.code)}
                  className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedJurisdiction === j.code
                      ? 'bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/20'
                      : 'text-[#8b949e] hover:text-white border border-transparent'
                  }`}
                >
                  {j.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#30363d]/60">
            <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-4">Compliance Pillar</h3>
            <div className="flex flex-col gap-2">
              {[
                { code: '', label: 'All Pillars' },
                { code: 'pillar_6', label: 'Pillar 6 (Cross-Border)' },
                { code: 'pillar_7', label: 'Pillar 7 (Security Safeguards)' }
              ].map(p => (
                <button
                  key={p.code}
                  onClick={() => handlePillarFilter(p.code)}
                  className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedPillar === p.code
                      ? 'bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/20'
                      : 'text-[#8b949e] hover:text-white border border-transparent'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1 space-y-6">
          <div className="flex justify-between items-center bg-[#161b22]/40 border border-[#30363d]/60 px-6 py-4 rounded-2xl">
            <span className="text-sm font-medium text-[#8b949e]">
              Showing {clauses.length} of {total} clauses
            </span>
            <div className="flex gap-1.5">
              {selectedJurisdiction && (
                <span className="text-xs bg-[#58a6ff]/10 text-[#58a6ff] px-2.5 py-1 rounded-full border border-[#58a6ff]/20">
                  {selectedJurisdiction}
                </span>
              )}
              {selectedPillar && (
                <span className="text-xs bg-[#bc8cff]/10 text-[#bc8cff] px-2.5 py-1 rounded-full border border-[#bc8cff]/20">
                  {selectedPillar.replace('_', ' ').toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[#8b949e]">Loading clauses from DB...</p>
            </div>
          ) : clauses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {clauses.map(c => (
                <ClauseCard key={c.id} clause={c} />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-[#30363d]/60">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff]/50 rounded-xl text-[#c9d1d9] disabled:opacity-40 disabled:hover:border-[#30363d] transition"
                  >
                    &larr; Previous
                  </button>
                  <span className="text-sm text-[#8b949e]">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm font-medium bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff]/50 rounded-xl text-[#c9d1d9] disabled:opacity-40 disabled:hover:border-[#30363d] transition"
                  >
                    Next &rarr;
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#161b22]/50 border border-[#30363d]/60 rounded-2xl py-16 text-center">
              <span className="text-4xl">📄</span>
              <h3 className="mt-4 text-lg font-semibold text-white">No clauses found</h3>
              <p className="text-[#8b949e] mt-1 max-w-sm mx-auto text-sm">
                No compliance entries matching the active filters exist in the database. Try changing filters.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
