"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getJurisdictionStats, getClauses } from '../lib/api';
import { JurisdictionStats } from '../lib/types';

export default function Dashboard() {
  const [stats, setStats] = useState<JurisdictionStats[]>([]);
  const [totalClauses, setTotalClauses] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, clausesData] = await Promise.all([
        getJurisdictionStats(),
        getClauses({ pageSize: 1 })
      ]);
      setStats(statsData || []);
      setTotalClauses(clausesData?.total || 0);
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Calculate totals
  const totalDocuments = stats.reduce((acc, curr) => acc + curr.doc_count, 0);
  const totalJurisdictions = stats.length;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#161b22] to-[#0d1117] border border-[#30363d] p-8 md:p-10 rounded-3xl shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-tr from-[#58a6ff]/10 to-[#bc8cff]/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/20">
            🤖 RegScope Compliance Engine v0.1.0
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Cross-Border Regulatory <span className="bg-gradient-to-r from-[#58a6ff] to-[#7ee787] bg-clip-text text-transparent">Intelligence</span>
          </h1>
          <p className="text-[#8b949e] text-base md:text-lg leading-relaxed">
            Automated crawler, vector-embedding indexer, and compliance mapper. Instantly search and verify regulatory requirements across multiple jurisdictions.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Scraped Documents', value: totalDocuments, icon: '📂', glow: 'shadow-[#58a6ff]/5 hover:shadow-[#58a6ff]/10' },
          { label: 'Extracted Clauses', value: totalClauses, icon: '📜', glow: 'shadow-[#bc8cff]/5 hover:shadow-[#bc8cff]/10' },
          { label: 'Jurisdictions Indexed', value: totalJurisdictions, icon: '🌍', glow: 'shadow-[#7ee787]/5 hover:shadow-[#7ee787]/10' },
        ].map((card, idx) => (
          <div 
            key={idx} 
            className={`bg-[#161b22] border border-[#30363d] p-6 rounded-2xl flex items-center justify-between shadow-lg hover:border-[#58a6ff]/30 transition-all duration-300 hover:-translate-y-1 ${card.glow}`}
          >
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#8b949e] uppercase tracking-wider">{card.label}</p>
              {loading ? (
                <div className="w-16 h-8 bg-[#0d1117]/80 animate-pulse rounded-lg mt-1" />
              ) : (
                <p className="text-4xl font-extrabold text-white">{card.value}</p>
              )}
            </div>
            <span className="text-4xl bg-[#0d1117] p-3.5 rounded-xl border border-[#30363d]">{card.icon}</span>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Jurisdictions Summary */}
        <div className="lg:col-span-2 bg-[#161b22] border border-[#30363d] p-6 rounded-2xl shadow-xl flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6">Jurisdictions Registry</h2>
          
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-8 h-8 border-4 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#8b949e]">Loading registry details...</p>
            </div>
          ) : stats.length > 0 ? (
            <div className="divide-y divide-[#30363d] overflow-hidden flex-1">
              {stats.map(j => (
                <div key={j.code} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏛️</span>
                    <div>
                      <h3 className="font-semibold text-white">{j.name}</h3>
                      <p className="text-xs text-[#8b949e] mt-0.5">Code: {j.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#58a6ff]">{j.doc_count} docs</p>
                    <p className="text-[10px] text-[#7ee787] font-semibold bg-[#7ee787]/10 px-2 py-0.5 rounded-full border border-[#7ee787]/20 uppercase mt-1">
                      Synced
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-[#8b949e]">
              No jurisdictions have been scraped yet. Visit the Crawl Manager to index documents.
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-1 bg-[#161b22] border border-[#30363d] p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="space-y-3">
              {[
                { label: 'Semantic Search', path: '/search', desc: 'Neural match queries against vector DB', color: 'hover:border-[#58a6ff]/40' },
                { label: 'Browse Clauses', path: '/clauses', desc: 'Browse all verified compliance clauses', color: 'hover:border-[#bc8cff]/40' },
                { label: 'Manage Scrapers', path: '/admin/crawl', desc: 'Trigger crawl tasks & feed pipelines', color: 'hover:border-[#7ee787]/40' },
                { label: 'Export Reports', path: '/export', desc: 'Generate compliance audit checklists', color: 'hover:border-white/20' },
              ].map((action, idx) => (
                <Link 
                  key={idx}
                  href={action.path}
                  className={`block p-4 rounded-xl bg-[#0d1117] border border-[#30363d] transition-all duration-200 group ${action.color}`}
                >
                  <p className="font-semibold text-white group-hover:text-[#58a6ff] transition-colors">{action.label}</p>
                  <p className="text-xs text-[#8b949e] mt-1">{action.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
