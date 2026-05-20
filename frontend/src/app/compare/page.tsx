"use client";
import React, { useState } from 'react';
import { getClauses } from '../../lib/api';
import { Clause } from '../../lib/types';

export default function ComparePage() {
  const [pillar, setPillar] = useState('pillar_6');
  const [jurA, setJurA] = useState('IN');
  const [jurB, setJurB] = useState('SG');
  const [loading, setLoading] = useState(false);
  
  const [clausesA, setClausesA] = useState<Clause[]>([]);
  const [clausesB, setClausesB] = useState<Clause[]>([]);
  const [searched, setSearched] = useState(false);

  const handleCompare = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const [resA, resB] = await Promise.all([
        getClauses({ jurisdiction: jurA, pillar, pageSize: 20 }),
        getClauses({ jurisdiction: jurB, pillar, pageSize: 20 })
      ]);
      setClausesA(resA.items || []);
      setClausesB(resB.items || []);
    } catch (e) {
      console.error('Error during comparison:', e);
    } finally {
      setLoading(false);
    }
  };

  const getJurName = (code: string) => {
    const names: Record<string, string> = {
      'IN': 'India (DPDP 2023)',
      'SG': 'Singapore (PDPA)',
      'EU': 'European Union (GDPR)'
    };
    return names[code] || code;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#c9d1d9] to-[#8b949e] bg-clip-text text-transparent">
          Jurisdiction Comparison
        </h1>
        <p className="text-[#8b949e] mt-2">
          Compare compliance mappings and obligations across different jurisdictions side-by-side.
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-2xl shadow-xl flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1 space-y-2">
          <label className="text-xs font-bold text-[#8b949e] uppercase">Compliance Pillar</label>
          <select 
            value={pillar}
            onChange={(e) => setPillar(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#58a6ff]"
          >
            <option value="pillar_6">Pillar 6 (Cross-Border Data Transfer)</option>
            <option value="pillar_7">Pillar 7 (Data Protection & Security)</option>
          </select>
        </div>

        <div className="flex-1 space-y-2">
          <label className="text-xs font-bold text-[#8b949e] uppercase">Jurisdiction A</label>
          <select 
            value={jurA}
            onChange={(e) => setJurA(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#58a6ff]"
          >
            <option value="IN">India (DPDP 2023)</option>
            <option value="SG">Singapore (PDPA)</option>
            <option value="EU">European Union (GDPR)</option>
          </select>
        </div>

        <div className="flex-1 space-y-2">
          <label className="text-xs font-bold text-[#8b949e] uppercase">Jurisdiction B</label>
          <select 
            value={jurB}
            onChange={(e) => setJurB(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#58a6ff]"
          >
            <option value="IN">India (DPDP 2023)</option>
            <option value="SG">Singapore (PDPA)</option>
            <option value="EU">European Union (GDPR)</option>
          </select>
        </div>

        <button 
          onClick={handleCompare}
          disabled={loading}
          className="w-full md:w-auto bg-[#58a6ff] hover:bg-[#58a6ff]/90 disabled:opacity-50 text-slate-950 font-bold px-8 py-3 rounded-xl shadow-lg shadow-[#58a6ff]/20 transition h-11"
        >
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </div>

      {/* Side-by-side columns */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#8b949e]">Fetching comparative data matrices...</p>
        </div>
      ) : searched ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column A */}
          <div className="space-y-6">
            <div className="bg-[#161b22]/80 border-b-2 border-[#58a6ff] p-5 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">{getJurName(jurA)}</h2>
              <p className="text-xs text-[#8b949e] mt-1">{clausesA.length} clauses detected</p>
            </div>
            
            <div className="space-y-4">
              {clausesA.length > 0 ? (
                clausesA.map(c => (
                  <div key={c.id} className="bg-[#161b22]/40 border border-[#30363d] p-5 rounded-2xl hover:border-[#30363d]/80 transition">
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-900/50 text-indigo-300 border border-indigo-800/30 uppercase mb-3">
                      {c.clause_type}
                    </span>
                    <p className="font-mono text-sm text-[#c9d1d9] leading-relaxed">"{c.raw_text}"</p>
                  </div>
                ))
              ) : (
                <div className="bg-[#161b22]/20 border border-[#30363d]/30 border-dashed rounded-2xl py-12 text-center text-[#8b949e] text-sm">
                  No clauses indexed for this combination.
                </div>
              )}
            </div>
          </div>

          {/* Column B */}
          <div className="space-y-6">
            <div className="bg-[#161b22]/80 border-b-2 border-[#bc8cff] p-5 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">{getJurName(jurB)}</h2>
              <p className="text-xs text-[#8b949e] mt-1">{clausesB.length} clauses detected</p>
            </div>

            <div className="space-y-4">
              {clausesB.length > 0 ? (
                clausesB.map(c => (
                  <div key={c.id} className="bg-[#161b22]/40 border border-[#30363d] p-5 rounded-2xl hover:border-[#30363d]/80 transition">
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-purple-900/50 text-purple-300 border border-purple-800/30 uppercase mb-3">
                      {c.clause_type}
                    </span>
                    <p className="font-mono text-sm text-[#c9d1d9] leading-relaxed">"{c.raw_text}"</p>
                  </div>
                ))
              ) : (
                <div className="bg-[#161b22]/20 border border-[#30363d]/30 border-dashed rounded-2xl py-12 text-center text-[#8b949e] text-sm">
                  No clauses indexed for this combination.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#161b22]/20 border border-[#30363d]/30 border-dashed rounded-3xl py-20 text-center">
          <span className="text-5xl opacity-60">⚖️</span>
          <h3 className="mt-4 text-lg font-semibold text-[#8b949e]">Select jurisdictions to compare</h3>
          <p className="text-[#8b949e]/60 mt-1 max-w-sm mx-auto text-sm">
            Choose a pillar and two jurisdictions above, then click Compare to map them side-by-side.
          </p>
        </div>
      )}
    </div>
  );
}
