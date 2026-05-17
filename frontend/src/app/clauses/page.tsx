"use client";
import React, { useState, useEffect } from 'react';
import { ClauseCard } from '../../components/Shared';

export default function ClausesPage() {
  const [clauses, setClauses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would use the API client
    // fetch('/api/v1/clauses').then(r => r.json()).then(d => setClauses(d.items));
    setTimeout(() => {
      setClauses([
        {
          id: '1',
          raw_text: 'Personal data shall not be transferred to a country or territory outside Singapore except in accordance with the requirements prescribed under this Act.',
          pillar: 'pillar_6',
          clause_type: 'prohibition',
          topics: ['cross_border_transfer'],
          confidence: 0.98,
          citations: [{ id: 'c1' }]
        },
        {
          id: '2',
          raw_text: 'An organisation must protect personal data in its possession or under its control by making reasonable security arrangements.',
          pillar: 'pillar_7',
          clause_type: 'obligation',
          topics: ['security_safeguards'],
          confidence: 0.95,
          citations: [{ id: 'c2' }]
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="container mx-auto p-8 flex gap-8">
      {/* Sidebar Filters */}
      <div className="w-64 shrink-0 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Jurisdiction</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" className="rounded bg-slate-800 border-slate-600" /> India (DPDP 2023)</label>
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" className="rounded bg-slate-800 border-slate-600" /> Singapore (PDPA)</label>
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" className="rounded bg-slate-800 border-slate-600" /> EU (GDPR)</label>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Pillar</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" className="rounded bg-slate-800 border-slate-600" /> Pillar 6 (Cross-Border)</label>
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" className="rounded bg-slate-800 border-slate-600" /> Pillar 7 (Domestic)</label>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-6 text-slate-100">Clause Browser</h1>
        
        {loading ? (
          <div className="text-slate-400">Loading clauses...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {clauses.map(c => <ClauseCard key={c.id} clause={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}
