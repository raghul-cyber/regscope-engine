"use client";
import React, { useState, useEffect, useCallback } from "react";
import { triggerCrawl, getJurisdictionStats } from "../../../lib/api";
import { JurisdictionStats } from "../../../lib/types";
import { Spinner } from "../../../components/Shared";
import { Bug, RefreshCw, CheckCircle, AlertCircle, Play, Activity } from "lucide-react";

export default function CrawlManager() {
  const [stats, setStats] = useState<JurisdictionStats[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [code, setCode] = useState("IN");
  const [depth, setDepth] = useState(2);
  const [queuing, setQueuing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting crawl for ${code} (depth=${depth})…`]);
    try {
      const r = await triggerCrawl(code, depth);
      if (r.success) {
        setStatus({ type: "success", text: `Crawl queued! Job ID: ${r.jobId}` });
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✓ Job queued: ${r.jobId}`]);
        setTimeout(fetchStats, 2000);
      } else {
        setStatus({ type: "error", text: r.message });
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✗ Error: ${r.message}`]);
      }
    } catch (err: any) {
      setStatus({ type: "error", text: err?.message || "Unexpected error" });
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✗ ${err?.message}`]);
    } finally {
      setQueuing(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-syne)" }}>Crawl Manager</h1>
          <span className="badge-amber">Admin</span>
        </div>
        <p className="text-sm mt-2 max-w-7xl mx-auto" style={{ color: "var(--text-secondary)" }}>
          Trigger jurisdiction scrapers to feed the ingestion pipeline
        </p>
      </div>

      <div className="page-content max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Crawl Config */}
          <div className="lg:col-span-2">
            <div className="rs-card-static space-y-5" style={{ padding: "2rem", borderRadius: "1rem" }}>
              <form onSubmit={handleStart} className="space-y-5">
                <div>
                  <label className="section-label block mb-2">Jurisdiction</label>
                  <select value={code} onChange={e => setCode(e.target.value)} className="select-field">
                    <option value="IN">India (DPDP 2023)</option>
                    <option value="SG">Singapore (PDPA)</option>
                    <option value="EU">European Union (GDPR)</option>
                  </select>
                </div>
                <div>
                  <label className="section-label block mb-2">Crawl Depth</label>
                  <input
                    type="number" min={1} max={5}
                    value={depth}
                    onChange={e => setDepth(parseInt(e.target.value))}
                    className="input-field"
                  />
                  <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                    How deep to follow internal links (1–5).
                  </p>
                </div>
                <button type="submit" disabled={queuing} className="btn-primary btn-full btn-lg">
                  {queuing ? "Queuing…" : <><Play size={14} /> Start Crawl</>}
                </button>
              </form>

              {status && (
                <div
                  className="flex items-start gap-3 p-3.5 rounded-xl text-sm"
                  style={{
                    background: status.type === "success" ? "rgba(0,255,136,0.06)" : "rgba(255,71,87,0.06)",
                    border: `1px solid ${status.type === "success" ? "rgba(0,255,136,0.2)" : "rgba(255,71,87,0.2)"}`,
                    color: status.type === "success" ? "var(--accent-green)" : "var(--accent-red)",
                  }}
                >
                  {status.type === "success" ? <CheckCircle size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", wordBreak: "break-all" }}>{status.text}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats + Log */}
          <div className="lg:col-span-3 space-y-6">
            {/* Jurisdiction index */}
            <div className="rs-card-static">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={16} style={{ color: "var(--accent-cyan)" }} />
                <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Jurisdiction Index</h2>
                <button onClick={fetchStats} className="ml-auto btn-ghost" style={{ height: "1.75rem", padding: "0 0.5rem", fontSize: "0.75rem" }}>
                  <RefreshCw size={12} />
                </button>
              </div>
              {loadingStats ? (
                <Spinner text="Loading…" size="sm" />
              ) : stats.length > 0 ? (
                <div className="space-y-3">
                  {stats.map(s => (
                    <div key={s.code} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-bold" style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>{s.code}</span>
                        <span className="text-sm" style={{ color: "var(--text-primary)" }}>{s.name}</span>
                      </div>
                      <span className="badge-cyan">{s.doc_count} docs</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>No jurisdictions indexed.</p>
              )}
            </div>

            {/* Terminal log */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)" }}
              >
                <span className="w-3 h-3 rounded-full" style={{ background: "rgba(255,71,87,0.6)" }} />
                <span className="w-3 h-3 rounded-full" style={{ background: "rgba(255,179,71,0.6)" }} />
                <span className="w-3 h-3 rounded-full" style={{ background: "rgba(0,255,136,0.6)" }} />
                <span className="ml-3 text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>crawl-log</span>
              </div>
              <div
                className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto text-xs leading-relaxed"
                style={{ fontFamily: "var(--font-mono)", color: "var(--accent-green)", background: "#050809" }}
              >
                {logs.length > 0 ? logs.map((line, i) => <div key={i}>{line}</div>) : (
                  <span style={{ color: "var(--text-muted)" }}>Waiting for crawl activity…</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
