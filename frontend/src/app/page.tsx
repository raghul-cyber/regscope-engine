"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getJurisdictionStats, getClauses } from "../lib/api";
import { JurisdictionStats } from "../lib/types";
import { StatCard, Spinner } from "../components/Shared";
import {
  RefreshCw, Search, FileText, Scale, Bug, Download,
  Globe, Database, BarChart3, Clock, ArrowRight
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState<JurisdictionStats[]>([]);
  const [totalClauses, setTotalClauses] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([getJurisdictionStats(), getClauses({ pageSize: 1 })]);
      setStats(s || []);
      setTotalClauses(c?.total || 0);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalDocs = stats.reduce((a, b) => a + b.doc_count, 0);

  const ACTIONS = [
    { title: "Semantic Search",  sub: "AI vector matching",       href: "/search",      icon: Search },
    { title: "Browse Clauses",   sub: "Paginated explorer",       href: "/clauses",     icon: FileText },
    { title: "Compare",          sub: "Side-by-side analysis",    href: "/compare",     icon: Scale },
    { title: "Crawl Manager",    sub: "Trigger scrapers",         href: "/admin/crawl", icon: Bug },
    { title: "Export Data",      sub: "JSON / CSV downloads",     href: "/export",      icon: Download },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="page-header">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="badge-green">● Live Database</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>AI-Powered</span>
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold leading-tight mb-3"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Cross-Border Regulatory
              <br />
              Analysis Engine
            </h1>
            <p className="text-base max-w-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Automated crawler, Qdrant vector-embedding indexer, and multi-jurisdiction
              compliance mapper across India, Singapore, and EU.
            </p>
          </div>
          <button onClick={fetchData} className="btn-ghost shrink-0">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </section>

      <div className="page-content max-w-7xl mx-auto space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rs-card-static">
                <div className="skeleton h-3 w-24 mb-3" />
                <div className="skeleton h-8 w-16 mb-2" />
                <div className="skeleton h-3 w-20" />
              </div>
            ))
          ) : (
            <>
              <StatCard label="Jurisdictions Indexed" value={stats.length} icon={<Globe size={18} />} />
              <StatCard label="Compliance Clauses" value={totalClauses.toLocaleString()} icon={<BarChart3 size={18} />} />
              <StatCard label="Documents Scraped" value={totalDocs.toLocaleString()} icon={<Database size={18} />} />
              <StatCard label="Pillars Mapped" value="2" icon={<Clock size={18} />} sub="Pillar 6 & 7" />
            </>
          )}
        </div>

        {/* Jurisdiction Registry */}
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--font-syne)" }}>
            Jurisdiction Registry
          </h2>

          {loading ? (
            <Spinner text="Loading jurisdictions…" />
          ) : stats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
              {stats.map(j => (
                <div key={j.code} className="rs-card-static">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{ background: "rgba(0,217,255,0.1)", color: "var(--accent-cyan)" }}
                      >
                        {j.code}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{j.name}</p>
                        <p className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                          <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: "var(--accent-green)" }} />
                          Indexed
                        </p>
                      </div>
                    </div>
                    <span className="badge-cyan">{j.doc_count} docs</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-16 text-center">
              <Globe size={36} style={{ color: "var(--text-muted)" }} className="mb-4" />
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                No jurisdictions indexed yet
              </p>
              <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                Run a crawl to populate the database
              </p>
              <Link href="/admin/crawl" className="btn-primary">Go to Crawl Manager</Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--font-syne)" }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 stagger">
            {ACTIONS.map(a => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.href}
                  href={a.href}
                  className="group block rs-card"
                  style={{ padding: "1.25rem" }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ background: "rgba(0,217,255,0.1)", color: "var(--accent-cyan)" }}
                  >
                    <Icon size={18} />
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{a.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{a.sub}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
