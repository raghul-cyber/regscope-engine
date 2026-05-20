"use client";
import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { PillarTag, CitationBadge, ConfidenceMeter } from '../../../components/Shared';
import { getAudit } from '../../../lib/api';

export default function ClauseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuditData() {
      setLoading(true);
      try {
        const auditData = await getAudit(id);
        setData(auditData);
      } catch (err) {
        console.error('Error loading audit details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAuditData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-10 h-10 border-4 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#8b949e]">Retrieving source documents and verifications...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <span className="text-4xl">⚠️</span>
        <h2 className="text-xl font-bold text-white">Clause Not Found</h2>
        <p className="text-[#8b949e] text-sm">
          The requested compliance clause or its audit trail could not be resolved in the database.
        </p>
        <Link href="/clauses" className="inline-block bg-[#58a6ff] text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm">
          &larr; Back to Browser
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#8b949e]">
        <Link href="/clauses" className="hover:text-white transition">
          Clause Browser
        </Link>
        <span>/</span>
        <span className="text-white truncate max-w-xs">{data.clause.id}</span>
      </div>

      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#c9d1d9] to-[#8b949e] bg-clip-text text-transparent">
          Compliance Audit Trail
        </h1>
        <p className="text-[#8b949e] mt-2">
          Verify the pipeline extraction flow, confidence parameters, and OCR source span coordinates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Extraction Details */}
        <div className="space-y-6">
          <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-2xl shadow-xl space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <PillarTag pillar={data.clause.pillar} />
              <span className="text-xs bg-[#0d1117] border border-[#30363d] px-3 py-1.5 rounded-full text-[#c9d1d9] uppercase font-bold tracking-wider">
                Type: {data.clause.clause_type}
              </span>
            </div>

            <blockquote className="border-l-4 border-[#58a6ff] bg-[#0d1117]/80 p-5 rounded-r-2xl font-mono text-sm leading-relaxed text-white">
              "{data.clause.raw_text}"
            </blockquote>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider">Extraction Confidence</h3>
              <ConfidenceMeter confidence={data.clause.confidence} />
            </div>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Source Citation Details</h3>
            {data.clause.citations && data.clause.citations.length > 0 ? (
              data.clause.citations.map((c: any, i: number) => (
                <div key={c.id || i} className="pb-4 last:pb-0 border-b border-[#30363d] last:border-0 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {c.article && <CitationBadge text={`Article: ${c.article}`} />}
                    {c.section_ref && <CitationBadge text={`Section: ${c.section_ref}`} />}
                    {c.page_number && <CitationBadge text={`Page: ${c.page_number}`} />}
                  </div>
                  <p className="text-xs font-mono bg-[#0d1117] p-3 rounded-xl border border-[#30363d] text-[#8b949e] leading-relaxed">
                    <span className="text-[#58a6ff] font-bold block mb-1">Snippet Match:</span>
                    "{c.verbatim_snippet}"
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#8b949e]">No explicit citation references associated with this entry.</p>
            )}
          </div>
        </div>

        {/* Right Column: Source Audit */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden flex flex-col shadow-xl">
          <div className="bg-[#1b2129] px-6 py-4 border-b border-[#30363d] flex justify-between items-center">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Verified Source Text Context</h3>
            {data.span_verification && data.span_verification.verified ? (
              <span className="text-[10px] font-bold bg-[#7ee787]/10 text-[#7ee787] border border-[#7ee787]/20 px-2 py-0.5 rounded-full uppercase">
                Span Verified
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-[#f85149]/10 text-[#f85149] border border-[#f85149]/20 px-2 py-0.5 rounded-full uppercase">
                Verification Idle
              </span>
            )}
          </div>

          <div className="p-6 flex-1 text-sm text-[#c9d1d9] font-mono leading-relaxed bg-[#0d1117] overflow-y-auto max-h-[350px]">
            {data.surrounding_context ? (
              data.surrounding_context.split(data.clause.raw_text).map((part: string, i: number, arr: any[]) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="bg-[#d29922]/20 text-[#d29922] font-bold outline outline-1 outline-[#d29922]/50 px-1 rounded mx-0.5">
                      {data.clause.raw_text}
                    </span>
                  )}
                </React.Fragment>
              ))
            ) : (
              <span className="text-[#8b949e] italic">No surrounding context file index available for this clause.</span>
            )}
          </div>

          <div className="bg-[#161b22] px-6 py-3.5 border-t border-[#30363d] text-xs text-[#8b949e] flex items-center justify-between">
            <span className="font-mono truncate max-w-[70%]">
              Hash: <span className="text-white font-semibold">{data.source_document?.content_hash || 'N/A'}</span>
            </span>
            {data.source_document?.url && (
              <a 
                href={data.source_document.url} 
                target="_blank" 
                rel="noreferrer" 
                className="text-[#58a6ff] hover:underline flex items-center gap-1 font-bold"
              >
                View Source URL &rarr;
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
