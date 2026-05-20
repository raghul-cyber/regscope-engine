"use client";
import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getAudit } from '../../../lib/api';
import { PillarTag, ConfidenceMeter, CitationBadge, Loader } from '../../../components/Shared';
import { ArrowLeft, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function ClauseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAudit(id).then(setData).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="py-40"><Loader size="lg" text="Loading audit trail…" /></div>
  );

  if (!data) return (
    <div className="max-w-lg mx-auto py-20 text-center space-y-4">
      <AlertCircle size={40} className="text-[var(--red-400)] mx-auto" />
      <h2 className="text-xl font-bold text-white">Clause Not Found</h2>
      <p className="text-sm text-[var(--text-muted)]">Could not find audit data for clause ID: <code className="font-mono text-[var(--blue-400)]">{id}</code></p>
      <Link href="/clauses" className="btn btn-secondary">← Back to Browser</Link>
    </div>
  );

  const { clause, source_document, span_verification, surrounding_context } = data;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link href="/clauses" className="hover:text-white flex items-center gap-1.5 transition-colors"><ArrowLeft size={14} /> Clause Browser</Link>
        <span>/</span>
        <span className="text-white font-mono text-xs truncate max-w-xs">{id}</span>
      </div>

      <h1 className="text-3xl font-black tracking-tight text-white">Compliance Audit Trail</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: extraction details */}
        <div className="space-y-5">
          <div className="card space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <PillarTag pillar={clause.pillar} />
              <span className="badge badge-slate uppercase">{clause.clause_type}</span>
            </div>

            <blockquote className="border-l-2 border-[var(--blue-500)] pl-4 font-mono text-sm text-[var(--text-secondary)] leading-relaxed">
              "{clause.raw_text}"
            </blockquote>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-faint)] mb-2">Extraction Confidence</p>
              <ConfidenceMeter confidence={clause.confidence ?? 0} />
            </div>
          </div>

          {clause.citations?.length > 0 && (
            <div className="card space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-faint)]">Citations ({clause.citations.length})</p>
              {clause.citations.map((c: any, i: number) => (
                <div key={c.id || i} className="space-y-2 pb-4 last:pb-0 border-b border-[var(--border-subtle)] last:border-0">
                  <div className="flex flex-wrap gap-1.5">
                    {c.article && <CitationBadge text={`Article: ${c.article}`} />}
                    {c.section_ref && <CitationBadge text={`§ ${c.section_ref}`} />}
                    {c.page_number && <CitationBadge text={`p.${c.page_number}`} />}
                  </div>
                  <p className="text-xs font-mono bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border-base)] text-[var(--text-muted)] leading-relaxed">
                    "{c.verbatim_snippet}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: source audit */}
        <div className="card flex flex-col overflow-hidden p-0">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-base)] bg-[var(--bg-base)]/50">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-faint)]">Source Document Context</p>
            {span_verification?.verified
              ? <span className="badge badge-green"><CheckCircle size={9} /> Span Verified</span>
              : <span className="badge badge-amber"><AlertCircle size={9} /> Unverified</span>
            }
          </div>

          <div className="flex-1 p-5 overflow-y-auto max-h-[320px] font-mono text-xs leading-loose text-[var(--text-secondary)] bg-[var(--bg-base)]/30">
            {surrounding_context ? (
              surrounding_context.split(clause.raw_text).map((part: string, i: number, arr: any[]) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <mark className="bg-[var(--amber-500)]/20 text-[var(--amber-400)] rounded px-0.5 mx-0.5 not-italic">
                      {clause.raw_text}
                    </mark>
                  )}
                </React.Fragment>
              ))
            ) : (
              <span className="text-[var(--text-faint)] italic">No surrounding context available.</span>
            )}
          </div>

          <div className="px-5 py-3 border-t border-[var(--border-base)] flex items-center justify-between bg-[var(--bg-base)]/50">
            <span className="text-[10px] font-mono text-[var(--text-faint)] truncate max-w-[60%]">
              {source_document?.content_hash || 'No hash'}
            </span>
            {source_document?.url && (
              <a href={source_document.url} target="_blank" rel="noreferrer" className="text-xs text-[var(--blue-400)] hover:underline flex items-center gap-1">
                Source <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
