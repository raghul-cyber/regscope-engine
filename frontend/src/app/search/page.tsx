"use client";
import React, { useState } from "react";
import { searchClauses } from "../../lib/api";
import { SearchResult } from "../../lib/types";
import { ClauseCard, Spinner, EmptyState } from "../../components/Shared";
import { Search } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try { setResults(await searchClauses(query)); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-syne)" }}>
            Semantic Search
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            AI vector search across all indexed compliance clauses
          </p>
        </div>
      </div>

      <div className="page-content max-w-7xl mx-auto space-y-8">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative max-w-3xl">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search regulatory concepts, e.g. 'data localisation requirements'..."
            className="w-full h-14 pl-12 pr-32 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
            }}
            onFocus={e => { e.target.style.borderColor = "var(--accent-cyan)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,217,255,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "var(--border-subtle)"; e.target.style.boxShadow = "none"; }}
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary absolute right-2 top-1/2 -translate-y-1/2"
            style={{ height: "2.5rem", padding: "0 1.25rem" }}
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        {/* Results */}
        {loading ? (
          <Spinner size="lg" text="Running neural embedding match…" />
        ) : results.length > 0 ? (
          <div className="space-y-4 animate-in">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{results.length}</span> results
            </p>
            {results.map((r, i) => {
              const pct = Math.round(r.score * 100);
              return (
                <div key={r.clause?.id || i} className="flex gap-4 items-start">
                  <div
                    className="shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      color: pct >= 85 ? "var(--accent-green)" : pct >= 70 ? "var(--accent-amber)" : "var(--accent-red)",
                      background: pct >= 85 ? "rgba(0,255,136,0.08)" : pct >= 70 ? "rgba(255,179,71,0.08)" : "rgba(255,71,87,0.08)",
                      border: `1px solid ${pct >= 85 ? "rgba(0,255,136,0.2)" : pct >= 70 ? "rgba(255,179,71,0.2)" : "rgba(255,71,87,0.2)"}`,
                    }}
                  >
                    {pct}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <ClauseCard clause={r.clause} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : searched ? (
          <EmptyState
            icon={<Search size={28} style={{ color: "var(--text-muted)" }} />}
            title="No matches found"
            description="Try broader search terms or different phrasing."
          />
        ) : (
          <EmptyState
            icon={<Search size={28} style={{ color: "var(--text-muted)" }} />}
            title="Ready to Search"
            description='Enter a regulatory concept above to query the vector store. Try terms like "consent requirements" or "cross-border transfer".'
          />
        )}
      </div>
    </div>
  );
}
