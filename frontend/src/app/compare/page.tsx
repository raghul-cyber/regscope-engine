"use client";
import React, { useState } from "react";
import { getClauses } from "../../lib/api";
import { ClauseCard, Spinner, EmptyState } from "../../components/Shared";
import { Scale } from "lucide-react";

const JURS = [
  { code: "IN", label: "India (DPDP 2023)" },
  { code: "SG", label: "Singapore (PDPA)" },
  { code: "EU", label: "EU (GDPR)" },
];

export default function ComparePage() {
  const [pillar, setPillar] = useState("pillar_6");
  const [jurA, setJurA] = useState("IN");
  const [jurB, setJurB] = useState("EU");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [clausesA, setClausesA] = useState<any[]>([]);
  const [clausesB, setClausesB] = useState<any[]>([]);

  const handleCompare = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const [a, b] = await Promise.all([
        getClauses({ jurisdiction: jurA, pillar, pageSize: 15 }),
        getClauses({ jurisdiction: jurB, pillar, pageSize: 15 }),
      ]);
      setClausesA(a.items || []);
      setClausesB(b.items || []);
    } finally { setLoading(false); }
  };

  const jurLabel = (c: string) => JURS.find(j => j.code === c)?.label || c;

  return (
    <div>
      <div className="page-header">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-syne)" }}>
            Jurisdiction Compare
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Side-by-side regulatory clause mapping
          </p>
        </div>
      </div>

      <div className="page-content max-w-7xl mx-auto space-y-8">
        {/* Config */}
        <div className="rs-card-static max-w-2xl" style={{ padding: "2rem", borderRadius: "1rem" }}>
          <div className="space-y-6">
            <div>
              <label className="section-label block mb-2">Compliance Pillar</label>
              <select value={pillar} onChange={e => setPillar(e.target.value)} className="select-field">
                <option value="pillar_6">Pillar 6 — Cross-Border Transfer</option>
                <option value="pillar_7">Pillar 7 — Security Safeguards</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="section-label block mb-2">Jurisdiction A</label>
                <select value={jurA} onChange={e => setJurA(e.target.value)} className="select-field">
                  {JURS.map(j => <option key={j.code} value={j.code}>{j.label}</option>)}
                </select>
              </div>
              <div>
                <label className="section-label block mb-2">Jurisdiction B</label>
                <select value={jurB} onChange={e => setJurB(e.target.value)} className="select-field">
                  {JURS.map(j => <option key={j.code} value={j.code}>{j.label}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleCompare} disabled={loading} className="btn-primary btn-full btn-lg">
              <Scale size={15} /> Run Comparison
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <Spinner size="lg" text="Fetching comparative data…" />
        ) : searched ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: jurLabel(jurA), clauses: clausesA, color: "var(--accent-cyan)" },
              { label: jurLabel(jurB), clauses: clausesB, color: "var(--accent-purple)" },
            ].map((col, idx) => (
              <div key={idx} className="rs-card-static" style={{ padding: 0, overflow: "hidden" }}>
                <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <span className="badge-cyan">{col.label}</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{col.clauses.length} clauses</span>
                </div>
                <div className="p-5 space-y-3">
                  {col.clauses.length > 0
                    ? col.clauses.map((c: any) => <ClauseCard key={c.id} clause={c} />)
                    : <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>No clauses for this combination.</p>
                  }
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Scale size={36} style={{ color: "var(--text-muted)" }} />}
            title="Select jurisdictions to compare"
            description="Choose a pillar and two jurisdictions, then click Compare."
          />
        )}
      </div>
    </div>
  );
}
