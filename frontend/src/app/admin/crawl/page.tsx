"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { triggerCrawl, getJurisdictionStats } from '../../../lib/api';
import { JurisdictionStats } from '../../../lib/types';

export default function CrawlManager() {
  const [stats, setStats] = useState<JurisdictionStats[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Scraper inputs
  const [selectedCode, setSelectedCode] = useState('IN');
  const [depth, setDepth] = useState(2);
  const [queuing, setQueuing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await getJurisdictionStats();
      setStats(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleStartCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    setQueuing(true);
    setStatusMessage(null);
    try {
      const result = await triggerCrawl(selectedCode, depth);
      if (result.success) {
        setStatusMessage({ type: 'success', text: `Successfully triggered crawl! Job ID: ${result.jobId}` });
        // Refresh stats
        setTimeout(fetchStats, 1000);
      } else {
        setStatusMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setQueuing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#c9d1d9] to-[#8b949e] bg-clip-text text-transparent">
          Crawl Manager
        </h1>
        <p className="text-[#8b949e] mt-2">
          Trigger web crawlers to scrape regulatory acts, run clause extraction, and update the vector store.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scraper Panel Form */}
        <div className="lg:col-span-1 bg-[#161b22] border border-[#30363d] p-6 rounded-2xl shadow-xl h-fit space-y-6">
          <h2 className="text-xl font-bold text-white">Trigger New Crawl</h2>
          
          <form onSubmit={handleStartCrawl} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#8b949e] uppercase">Jurisdiction</label>
              <select
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#58a6ff]"
              >
                <option value="IN">India (DPDP 2023)</option>
                <option value="SG">Singapore (PDPA)</option>
                <option value="EU">EU (GDPR)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#8b949e] uppercase">Crawl Depth</label>
              <input
                type="number"
                min="1"
                max="5"
                value={depth}
                onChange={(e) => setDepth(parseInt(e.target.value))}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#58a6ff]"
              />
              <p className="text-xs text-[#8b949e]">
                Determines how deep the crawler follows relative links. Range: 1–5.
              </p>
            </div>

            <button
              type="submit"
              disabled={queuing}
              className="w-full bg-[#58a6ff] hover:bg-[#58a6ff]/90 disabled:opacity-50 text-slate-950 font-bold py-3.5 rounded-xl transition"
            >
              {queuing ? 'Triggering...' : 'Start Scraper'}
            </button>
          </form>

          {statusMessage && (
            <div className={`p-4 rounded-xl border text-sm ${
              statusMessage.type === 'success' 
                ? 'bg-[#7ee787]/10 border-[#7ee787]/20 text-[#7ee787]'
                : 'bg-[#f85149]/10 border-[#f85149]/20 text-[#f85149]'
            }`}>
              {statusMessage.text}
            </div>
          )}
        </div>

        {/* Database Stats Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">Scraped Jurisdictions Summary</h2>
            
            {loadingStats ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-8 h-8 border-4 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-[#8b949e]">Loading jurisdiction details...</p>
              </div>
            ) : stats.length > 0 ? (
              <div className="divide-y divide-[#30363d] overflow-hidden">
                {stats.map(s => (
                  <div key={s.code} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{s.name}</h3>
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#8b949e] mt-1">
                        Code: <code className="bg-[#0d1117] px-1.5 py-0.5 rounded text-white">{s.code}</code>
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-[#58a6ff]">{s.doc_count}</p>
                      <p className="text-xs text-[#8b949e] uppercase font-bold">Documents</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-[#8b949e] text-sm">
                No active jurisdictions found in database.
              </div>
            )}
          </div>

          <div className="bg-[#161b22]/30 border border-[#30363d]/60 p-6 rounded-2xl text-sm space-y-2">
            <h4 className="font-bold text-white">ℹ️ Celery Task Runner Status</h4>
            <p className="text-[#8b949e]">
              Scraping jobs run asynchronously inside the Celery Worker Space (`regscope-workers`). 
              They are queued via Upstash Redis and executed in the background to ensure page load times remain fast.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
