"use client";
import React, { useState } from 'react';
import { getClauses } from '../../lib/api';
import { ClauseCard, Loader, EmptyState, PageHeader } from '../../components/Shared';
import { Scale } from 'lucide-react';

const JURISDICTIONS = [
  { code: 'IN', label: 'India (DPDP 2023)' },
  { code: 'SG', label: 'Singapore (PDPA)' },
  { code: 'EU', label: 'EU (GDPR)' },
];
const PILLARS = [
  { code: 'pillar_6', label: 'Pillar 6 — Cross-Border Transfer' },
  { code: 'pillar_7', label: 'Pillar 7 — Security Safeguards' },
];

const BORDER_COLORS = ['border-[var(--blue-500)]', 'border-[var(--purple-500)]'];

export default function ComparePage() {
  const [pillar, setPillar] = useState('pillar_6');
  const [jurA, setJurA] = useState('IN');
  const [jurB, setJurB] = useState('EU');
  const [clausesA, setClausesA] = useState<any[]>([]);
  const [clausesB, setClausesB] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleCompare = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const [rA, rB] = await Promise.all([
        getClauses({ jurisdiction: jurA, pillar, pageSize: 15 }),
        getClauses({ jurisdiction: jurB, pillar, pageSize: 15 }),
      ]);
      setClausesA(rA.items || []);
      setClausesB(rB.items || []);
    } finally {
      setLoading(false);
    }
  };

  const jurLabel = (code: string) => JURISDICTIONS.find(j => j.code === code)?.label || code;

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Jurisdiction Comparison" subtitle="Side-by-side regulatory clause mapping" />

      <div className="card flex flex-col md:flex-row gap-4 items-end">
        {[
          { label: 'Pillar', value: pillar, setter: setPillar, opts: PILLARS.map(p => ({ value: p.code, label: p.label })) },
          { label: 'Jurisdiction A', value: jurA, setter: setJurA, opts: JURISDICTIONS.map(j => ({ value: j.code, label: j.label })) },
          { label: 'Jurisdiction B', value: jurB, setter: setJurB, opts: JURISDICTIONS.map(j => ({ value: j.code, label: j.label })) },
        ].map(f => (
          <div key={f.label} className="flex-1 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-faint)]">{f.label}</label>
            <select value={f.value} onChange={e => f.setter(e.target.value)} className="input">
              {f.opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        ))}
        <button onClick={handleCompare} disabled={loading} className="btn btn-primary shrink-0 h-[42px]">
          <Scale size={15} /> Compare
        </button>
      </div>

      {loading ? (
        <div className="py-20"><Loader size="lg" text="Fetching comparative data…" /></div>
      ) : searched ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: jurLabel(jurA), clauses: clausesA, border: BORDER_COLORS[0] },
            { label: jurLabel(jurB), clauses: clausesB, border: BORDER_COLORS[1] },
          ].map((col, idx) => (
            <div key={idx} className="space-y-4">
              <div className={`card border-t-2 ${col.border} rounded-t-xl`}>
                <h2 className="text-base font-bold text-white">{col.label}</h2>
                <p className="text-xs text-[var(--text-faint)] mt-1">{col.clauses.length} clauses</p>
              </div>
              {col.clauses.length > 0
                ? col.clauses.map((c: any, i: number) => (
                    <div key={c.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                      <ClauseCard clause={c} />
                    </div>
                  ))
                : <EmptyState icon="📄" title="No clauses" description="No entries found for this jurisdiction + pillar combination." />
              }
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon="⚖️" title="Select jurisdictions to compare" description="Choose a pillar and two jurisdictions, then click Compare." />
      )}
    </div>
  );
}
