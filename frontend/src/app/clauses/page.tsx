"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { getClauses } from '../../lib/api';
import { ClauseCard, SkeletonCard, EmptyState, Pagination, PageHeader } from '../../components/Shared';
import { Filter } from 'lucide-react';

const JURISDICTIONS = [
  { code: '', label: 'All Jurisdictions' },
  { code: 'IN', label: 'India (DPDP)' },
  { code: 'SG', label: 'Singapore (PDPA)' },
  { code: 'EU', label: 'EU (GDPR)' },
];
const PILLARS = [
  { code: '', label: 'All Pillars' },
  { code: 'pillar_6', label: 'Pillar 6 — Cross-Border' },
  { code: 'pillar_7', label: 'Pillar 7 — Security' },
];
const TYPES = [
  { code: '', label: 'All Types' },
  { code: 'prohibition', label: 'Prohibition' },
  { code: 'obligation', label: 'Obligation' },
  { code: 'permission', label: 'Permission' },
  { code: 'right', label: 'Right' },
];

export default function ClausesPage() {
  const [clauses, setClauses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 10;

  const [jur, setJur] = useState('');
  const [pillar, setPillar] = useState('');
  const [type, setType] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const d = await getClauses({ jurisdiction: jur || undefined, pillar: pillar || undefined, clause_type: type || undefined, page, pageSize: PAGE_SIZE });
      setClauses(d.items || []);
      setTotal(d.total || 0);
    } finally {
      setLoading(false);
    }
  }, [jur, pillar, type, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const setFilter = (setter: React.Dispatch<React.SetStateAction<string>>, val: string) => {
    setter(val);
    setPage(1);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Clause Browser" subtitle={`${total.toLocaleString()} clauses in database`} />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar filters */}
        <aside className="w-full lg:w-56 shrink-0 card space-y-6 h-fit">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
            <Filter size={14} /> Filters
          </div>

          {[
            { label: 'Jurisdiction', options: JURISDICTIONS, value: jur, setter: setJur },
            { label: 'Pillar', options: PILLARS, value: pillar, setter: setPillar },
            { label: 'Clause Type', options: TYPES, value: type, setter: setType },
          ].map(f => (
            <div key={f.label}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-faint)] mb-2">{f.label}</p>
              <div className="flex flex-col gap-0.5">
                {f.options.map(o => (
                  <button
                    key={o.code}
                    onClick={() => setFilter(f.setter, o.code)}
                    className={`text-left text-sm px-2.5 py-1.5 rounded-lg transition-all font-medium
                      ${f.value === o.code
                        ? 'bg-[var(--blue-glow)] text-[var(--blue-400)] border border-[rgba(59,130,246,0.2)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-transparent'
                      }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Main content */}
        <section className="flex-1 space-y-4">
          {/* Active filters chips */}
          {(jur || pillar || type) && (
            <div className="flex flex-wrap gap-2">
              {jur    && <span className="badge badge-blue">{jur} <button className="ml-1 opacity-60 hover:opacity-100" onClick={() => setJur('')}>×</button></span>}
              {pillar && <span className="badge badge-green">{pillar} <button className="ml-1 opacity-60 hover:opacity-100" onClick={() => setPillar('')}>×</button></span>}
              {type   && <span className="badge badge-amber">{type} <button className="ml-1 opacity-60 hover:opacity-100" onClick={() => setType('')}>×</button></span>}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
          ) : clauses.length > 0 ? (
            <>
              <div className="space-y-4">
                {clauses.map((c, i) => (
                  <div key={c.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                    <ClauseCard clause={c} />
                  </div>
                ))}
              </div>
              <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} onChange={setPage} />
            </>
          ) : (
            <EmptyState icon="📄" title="No clauses found" description="Adjust the filters or run a crawl to index new documents." action={{ label: 'Go to Crawl Manager', href: '/admin/crawl' }} />
          )}
        </section>
      </div>
    </div>
  );
}
