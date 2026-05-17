"use client";
import React, { useEffect, useState } from 'react';
import { PillarTag, CitationBadge, ConfidenceMeter } from '../../../components/Shared';

export default function ClauseDetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Mock data for clause detail + audit
    setTimeout(() => {
      setData({
        clause: {
          id: params.id,
          raw_text: 'Personal data shall not be transferred to a country or territory outside Singapore except in accordance with the requirements prescribed under this Act.',
          pillar: 'pillar_6',
          clause_type: 'prohibition',
          topics: ['cross_border_transfer'],
          confidence: 0.98,
          flags: [],
        },
        source_document: { url: 'https://sso.agc.gov.sg/Act/PDPA2012', content_hash: 'sha256:abc123' },
        span_verification: { verified: true, snippet_match: true },
        surrounding_context: '...the individual has consented to the transfer. Personal data shall not be transferred to a country or territory outside Singapore except in accordance with the requirements prescribed under this Act. Any organisation that contravenes...',
        citations: [{
          article: 'Section 26',
          section_ref: 'Part V',
          page_number: 14,
          authority_tier: 'primary',
          verbatim_snippet: 'Personal data shall not be transferred to a country or territory outside Singapore except in accordance with the requirements prescribed under this Act.'
        }]
      });
    }, 500);
  }, [params.id]);

  if (!data) return <div className="p-8 text-slate-400">Loading audit trail...</div>;

  return (
    <div className="container mx-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: Extraction Details */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <PillarTag pillar={data.clause.pillar} />
          <span className="text-sm bg-slate-800 border border-slate-700 px-3 py-1 rounded text-slate-300">Type: {data.clause.clause_type}</span>
        </div>
        
        <h1 className="text-2xl font-bold font-mono text-slate-100 border-l-4 border-blue-500 pl-4 py-2 bg-slate-800/50">
          "{data.clause.raw_text}"
        </h1>
        
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg">
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Pipeline Confidence</h3>
          <ConfidenceMeter confidence={data.clause.confidence} />
        </div>

        <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg">
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Citations</h3>
          {data.citations.map((c: any, i: number) => (
            <div key={i} className="mb-4 last:mb-0 pb-4 last:pb-0 border-b border-slate-700 last:border-0">
              <div className="flex gap-2 mb-2">
                <CitationBadge text={c.article} />
                <CitationBadge text={`Tier: ${c.authority_tier}`} />
              </div>
              <p className="text-sm text-slate-300 font-mono bg-slate-900 p-2 rounded line-clamp-2">
                {c.verbatim_snippet}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Source Audit */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden flex flex-col">
        <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-slate-200">Source Audit Document</h3>
          {data.span_verification.verified ? (
            <span className="text-xs bg-green-900/50 text-green-400 border border-green-800 px-2 py-1 rounded">Span Verified</span>
          ) : (
            <span className="text-xs bg-red-900/50 text-red-400 border border-red-800 px-2 py-1 rounded">Verification Failed</span>
          )}
        </div>
        <div className="p-4 flex-1 text-slate-300 font-mono text-sm leading-relaxed overflow-auto">
          {/* Simulated HTML highlighting */}
          {data.surrounding_context.split(data.clause.raw_text).map((part: string, i: number, arr: any[]) => (
            <React.Fragment key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="bg-yellow-900/40 text-yellow-200 outline outline-2 outline-yellow-600/50 rounded-sm">
                  {data.clause.raw_text}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="bg-slate-800 px-4 py-2 border-t border-slate-700 text-xs text-slate-500 font-mono">
          Immutable Hash: {data.source_document.content_hash}
        </div>
      </div>
    </div>
  );
}
