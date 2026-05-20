"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { triggerCrawl, getJurisdictionStats } from '../../../lib/api';
import { JurisdictionStats } from '../../../lib/types';
import { PageHeader, Loader } from '../../../components/Shared';
import { Bug, RefreshCw, CheckCircle, AlertCircle, Activity } from 'lucide-react';

export default function CrawlManager() {
  const [stats, setStats] = useState<JurisdictionStats[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [selectedCode, setSelectedCode] = useState('IN');
  const [depth, setDepth] = useState(2);
  const [queuing, setQueuing] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try { setStats((await getJurisdictionStats()) || []); }
    finally { setLoadingStats(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setQueuing(true);
    setStatus(null);
    try {
      const r = await triggerCrawl(selectedCode, depth);
      setStatus(r.success
        ? { type: 'success', text: `✅ Crawl queued! Job ID: ${r.jobId}` }
        : { type: 'error', text: `❌ ${r.message}` }
      );
      if (r.success) setTimeout(fetchStats, 2000);
    } catch (err: any) {
      setStatus({ type: 'error', text: `❌ ${err?.message || 'Unexpected error'}` });
    } finally {
      setQueuing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Crawl Manager"
        subtitle="Trigger jurisdiction scrapers to feed the ingestion pipeline"
        actions={
          <button onClick={fetchStats} className="btn btn-secondary btn-sm">
            <RefreshCw size={13} /> Refresh
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trigger Panel */}
        <div className="card space-y-5">
          <div className="flex items-center gap-2">
            <Bug size={16} className="text-[var(--amber-400)]" />
            <h2 className="text-base font-bold text-white">New Crawl Job</h2>
          </div>

          <form onSubmit={handleStart} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-faint)]">Jurisdiction</label>
              <select
                value={selectedCode}
                onChange={e => setSelectedCode(e.target.value)}
                className="input"
              >
                <option value="IN">India (DPDP 2023)</option>
                <option value="SG">Singapore (PDPA)</option>
                <option value="EU">European Union (GDPR)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-faint)]">Crawl Depth</label>
              <input
                type="number" min={1} max={5}
                value={depth}
                onChange={e => setDepth(parseInt(e.target.value))}
                className="input"
              />
              <p className="text-xs text-[var(--text-faint)]">
                How deep to follow internal links. Higher = slower but more thorough.
              </p>
            </div>

            <button type="submit" disabled={queuing} className="btn btn-primary w-full btn-lg">
              {queuing ? <><Loader size="sm" /> Queuing…</> : <><Bug size={15} /> Start Crawl</>}
            </button>
          </form>

          {status && (
            <div className={`flex items-start gap-3 p-3.5 rounded-xl text-sm border
              ${status.type === 'success'
                ? 'bg-[var(--green-glow)] border-[rgba(16,185,129,0.2)] text-[var(--green-400)]'
                : 'bg-[var(--red-glow)] border-[rgba(239,68,68,0.2)] text-[var(--red-400)]'
              }`}
            >
              {status.type === 'success'
                ? <CheckCircle size={16} className="shrink-0 mt-0.5" />
                : <AlertCircle size={16} className="shrink-0 mt-0.5" />
              }
              <p className="font-mono text-xs leading-relaxed break-all">{status.text}</p>
            </div>
          )}
        </div>

        {/* Stats panel */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[var(--blue-400)]" />
              <h2 className="text-base font-bold text-white">Jurisdiction Index</h2>
            </div>
          </div>

          {loadingStats ? (
            <div className="py-10"><Loader size="md" text="Loading index data…" /></div>
          ) : stats.length > 0 ? (
            <div className="divide-y divide-[var(--border-subtle)]">
              {stats.map(s => (
                <div key={s.code} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[var(--blue-glow)] flex items-center justify-center text-sm font-bold text-[var(--blue-400)]">{s.code}</div>
                    <div>
                      <p className="text-sm font-semibold text-white">{s.name}</p>
                      <p className="text-xs text-[var(--text-faint)] flex items-center gap-1 mt-0.5">
                        <span className="status-dot online" /> Indexed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black tabular-nums text-[var(--blue-400)]">{s.doc_count}</p>
                    <p className="text-[10px] text-[var(--text-faint)] uppercase font-bold">documents</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)] text-center py-10">
              No jurisdictions indexed. Trigger a crawl to populate the database.
            </p>
          )}

          <div className="mt-6 p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-base)] text-xs text-[var(--text-faint)] leading-relaxed">
            <strong className="text-[var(--text-muted)]">ℹ️ How it works:</strong> Jobs are queued via Upstash Redis and processed asynchronously by the Celery worker container on Hugging Face Spaces. Results appear in the Clause Browser after ingestion completes.
          </div>
        </div>
      </div>
    </div>
  );
}
