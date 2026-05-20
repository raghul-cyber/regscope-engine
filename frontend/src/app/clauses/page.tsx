"use client";
import React, { useState, useEffect, useCallback } from "react";
import { getClauses } from "../../lib/api";
import { ClauseCard, Spinner, EmptyState, Pagination } from "../../components/Shared";
import { FileText } from "lucide-react";

export default function ClausesPage() {
  const [clauses, setClauses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 10;
  const [jur, setJur] = useState("");
  const [pillar, setPillar] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await getClauses({ jurisdiction: jur || undefined, pillar: pillar || undefined, page, pageSize: PAGE_SIZE });
      setClauses(d.items || []);
      setTotal(d.total || 0);
    } finally { setLoading(false); }
  }, [jur, pillar, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="page-header">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-syne)" }}>Browse Clauses</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Navigate and inspect extracted regulatory clauses
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div
        className="flex flex-wrap items-end gap-4 px-8 py-5"
        style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}
      >
        <div className="max-w-7xl mx-auto w-full flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1" style={{ minWidth: 180 }}>
            <label className="section-label">Jurisdiction</label>
            <select value={jur} onChange={e => { setJur(e.target.value); setPage(1); }} className="select-field">
              <option value="">All Jurisdictions</option>
              <option value="IN">India (DPDP 2023)</option>
              <option value="SG">Singapore (PDPA)</option>
              <option value="EU">EU (GDPR)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1" style={{ minWidth: 200 }}>
            <label className="section-label">Compliance Pillar</label>
            <select value={pillar} onChange={e => { setPillar(e.target.value); setPage(1); }} className="select-field">
              <option value="">All Pillars</option>
              <option value="pillar_6">Pillar 6 — Cross-Border</option>
              <option value="pillar_7">Pillar 7 — Security</option>
            </select>
          </div>
          <div className="ml-auto self-end">
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{total}</span> clauses
            </span>
          </div>
        </div>
      </div>

      <div className="page-content max-w-7xl mx-auto">
        {loading ? (
          <Spinner text="Loading clauses…" />
        ) : clauses.length > 0 ? (
          <>
            <div className="space-y-3">
              {clauses.map(c => <ClauseCard key={c.id} clause={c} />)}
            </div>
            <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} onChange={setPage} />
          </>
        ) : (
          <EmptyState
            icon={<FileText size={28} style={{ color: "var(--text-muted)" }} />}
            title="No clauses found"
            description="Adjust the filters or run a crawl to index new documents."
            action={{ label: "Go to Crawl Manager", href: "/admin/crawl" }}
          />
        )}
      </div>
    </div>
  );
}
