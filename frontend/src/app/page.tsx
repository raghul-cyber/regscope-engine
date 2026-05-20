"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getJurisdictionStats, getClauses } from '../lib/api';
import { JurisdictionStats } from '../lib/types';
import { StatCard, SkeletonStatCard, PageHeader } from '../components/Shared';
import {
  FileText, Database, Globe, Activity, ArrowRight,
  Search, Download, Bug, Scale, Zap, CheckCircle
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<JurisdictionStats[]>([]);
  const [totalClauses, setTotalClauses] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([
        getJurisdictionStats(),
        getClauses({ pageSize: 1 }),
      ]);
      setStats(s || []);
      setTotalClauses(c?.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalDocs = stats.reduce((a, b) => a + b.doc_count, 0);

  return (
    <div className="space-y-10 animate-fade-in">
      <PageHeader
        title="Compliance Intelligence"
        subtitle="Real-time cross-border regulatory mapping across multiple jurisdictions"
        actions={
          <button onClick={fetchData} className="btn btn-secondary btn-sm">
            <Activity size={14} /> Refresh
          </button>
        }
      />

      {/* ---- Hero Banner ---- */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border-base)] bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-subtle)] p-8 md:p-10">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--blue-500)]/5 via-transparent to-[var(--purple-500)]/5 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--blue-500)]/6 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-blue"><Zap size={9} /> AI-Powered</span>
            <span className="badge badge-green"><CheckCircle size={9} /> Live Database</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white leading-tight">
            Cross-Border Regulatory
            <span className="gradient-text block">Analysis Engine</span>
          </h2>
          <p className="text-[var(--text-muted)] text-base leading-relaxed">
            Automated crawler, Qdrant vector-embedding indexer, and multi-jurisdiction compliance mapper.
            Instantly search and verify regulatory requirements across India, Singapore, and EU.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/search" className="btn btn-primary">
              <Search size={15} /> Start Searching
            </Link>
            <Link href="/admin/crawl" className="btn btn-secondary">
              <Bug size={15} /> Manage Crawlers
            </Link>
          </div>
        </div>
      </div>

      {/* ---- Stats ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {loading ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          <>
            <StatCard
              label="Indexed Documents"
              value={totalDocs.toLocaleString()}
              icon={<Database size={20} />}
              color="blue"
            />
            <StatCard
              label="Extracted Clauses"
              value={totalClauses.toLocaleString()}
              icon={<FileText size={20} />}
              color="green"
            />
            <StatCard
              label="Active Jurisdictions"
              value={stats.length}
              icon={<Globe size={20} />}
              color="purple"
            />
          </>
        )}
      </div>

      {/* ---- Jurisdictions + Quick Actions ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jurisdiction registry */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">Jurisdiction Registry</h2>
            <span className="badge badge-slate">{stats.length} indexed</span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-[var(--border-subtle)] last:border-0">
                  <div className="space-y-1.5">
                    <div className="skeleton h-4 w-40 rounded" />
                    <div className="skeleton h-3 w-16 rounded" />
                  </div>
                  <div className="skeleton h-8 w-16 rounded-lg" />
                </div>
              ))}
            </div>
          ) : stats.length > 0 ? (
            <div className="divide-y divide-[var(--border-subtle)]">
              {stats.map((j, idx) => (
                <div key={j.code} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 animate-fade-in" style={{ animationDelay: `${idx * 0.08}s` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[var(--blue-glow)] flex items-center justify-center text-sm font-bold text-[var(--blue-400)] shrink-0">
                      {j.code}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{j.name}</p>
                      <p className="text-xs text-[var(--text-faint)] flex items-center gap-1 mt-0.5">
                        <span className="status-dot online" /> Synced
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black tabular-nums text-[var(--blue-400)]">{j.doc_count}</p>
                    <p className="text-[10px] text-[var(--text-faint)] uppercase font-bold">docs</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-[var(--text-muted)] text-sm">
              No jurisdictions indexed yet.{' '}
              <Link href="/admin/crawl" className="text-[var(--blue-400)] hover:underline">Run a crawl →</Link>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card flex flex-col">
          <h2 className="text-base font-bold text-white mb-5">Quick Actions</h2>
          <div className="space-y-2.5 flex-1">
            {[
              { label: 'Semantic Search',   sub: 'Neural vector matching',     path: '/search',      icon: Search,   color: 'var(--blue-400)' },
              { label: 'Browse Clauses',    sub: 'Paginated clause explorer',  path: '/clauses',     icon: FileText, color: 'var(--green-400)' },
              { label: 'Jurisdiction Compare', sub: 'Side-by-side analysis',  path: '/compare',     icon: Scale,    color: 'var(--purple-400)' },
              { label: 'Crawl Manager',     sub: 'Trigger scrapers',           path: '/admin/crawl', icon: Bug,      color: 'var(--amber-400)' },
              { label: 'Export Data',       sub: 'JSON / CSV downloads',       path: '/export',      icon: Download, color: 'var(--text-muted)' },
            ].map(a => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.path}
                  href={a.path}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-elevated)] border border-transparent hover:border-[var(--border-base)] transition-all group"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `color-mix(in srgb, ${a.color} 12%, transparent)` }}
                  >
                    <Icon size={15} style={{ color: a.color }} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight group-hover:text-white transition-colors">{a.label}</p>
                    <p className="text-xs text-[var(--text-faint)] leading-tight mt-0.5">{a.sub}</p>
                  </div>
                  <ArrowRight size={14} className="text-[var(--text-faint)] group-hover:text-[var(--text-muted)] transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
