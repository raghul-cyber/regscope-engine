"use client";
import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { getAudit } from "../../../lib/api";
import { PillarTag, ConfidenceBar, CitationBadge, Spinner } from "../../../components/Shared";
import { ArrowLeft, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

export default function ClauseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getAudit(id).then(setData).finally(() => setLoading(false)); }, [id]);

  if (loading) return <div className="page-content"><Spinner size="lg" text="Loading audit trail…" /></div>;

  if (!data) return (
    <div className="page-content max-w-lg mx-auto py-20 text-center">
      <AlertCircle size={40} style={{ color: "var(--accent-red)" }} className="mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">Clause Not Found</h2>
      <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
        No audit data for: <code style={{ fontFamily: "var(--font-mono)", color: "var(--accent-cyan)" }}>{id}</code>
      </p>
      <Link href="/clauses" className="btn-ghost">← Back to Browser</Link>
    </div>
  );

  const { clause, source_document, span_verification, surrounding_context } = data;

  return (
    <div>
      <div className="page-header">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            <Link href="/clauses" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <ArrowLeft size={14} /> Browse Clauses
            </Link>
            <span>/</span>
            <span className="truncate max-w-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)", fontSize: "0.75rem" }}>{id}</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-syne)" }}>Compliance Audit Trail</h1>
        </div>
      </div>

      <div className="page-content max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: extraction details */}
          <div className="space-y-5">
            <div className="rs-card-static space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <PillarTag pillar={clause.pillar} />
                <span className="badge-neutral uppercase">{clause.clause_type}</span>
              </div>
              <blockquote
                className="text-sm leading-relaxed pl-4"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-secondary)",
                  borderLeft: "2px solid var(--accent-cyan-dim)",
                }}
              >
                "{clause.raw_text}"
              </blockquote>
              <div>
                <p className="section-label mb-2">Extraction Confidence</p>
                <ConfidenceBar confidence={clause.confidence ?? 0} />
              </div>
            </div>

            {clause.citations?.length > 0 && (
              <div className="rs-card-static space-y-4">
                <p className="section-label">Citations ({clause.citations.length})</p>
                {clause.citations.map((c: any, i: number) => (
                  <div key={c.id || i} className="space-y-2 pb-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <div className="flex flex-wrap gap-1.5">
                      {c.article && <CitationBadge text={`Article: ${c.article}`} />}
                      {c.section_ref && <CitationBadge text={`§ ${c.section_ref}`} />}
                      {c.page_number && <CitationBadge text={`p.${c.page_number}`} />}
                    </div>
                    <p
                      className="text-xs p-3 rounded-lg leading-relaxed"
                      style={{
                        fontFamily: "var(--font-mono)",
                        background: "var(--bg-base)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-muted)",
                      }}
                    >
                      "{c.verbatim_snippet}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: source context */}
          <div className="rs-card-static flex flex-col overflow-hidden" style={{ padding: 0 }}>
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--border-subtle)", background: "rgba(8,11,17,0.5)" }}>
              <p className="section-label">Source Document Context</p>
              {span_verification?.verified
                ? <span className="badge-green"><CheckCircle size={9} /> Verified</span>
                : <span className="badge-amber"><AlertCircle size={9} /> Unverified</span>}
            </div>
            <div
              className="flex-1 p-5 overflow-y-auto text-xs leading-loose"
              style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)", maxHeight: 320, background: "rgba(8,11,17,0.3)" }}
            >
              {surrounding_context ? (
                surrounding_context.split(clause.raw_text).map((part: string, i: number, arr: any[]) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <mark style={{ background: "rgba(255,179,71,0.15)", color: "var(--accent-amber)", borderRadius: 2, padding: "0 2px" }}>
                        {clause.raw_text}
                      </mark>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No surrounding context available.</span>
              )}
            </div>
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--border-subtle)", background: "rgba(8,11,17,0.5)" }}>
              <span className="text-[10px] truncate max-w-[60%]" style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                {source_document?.content_hash || "No hash"}
              </span>
              {source_document?.url && (
                <a href={source_document.url} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1" style={{ color: "var(--accent-cyan)" }}>
                  Source <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
