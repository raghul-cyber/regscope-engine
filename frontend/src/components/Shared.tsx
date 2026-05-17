import React from 'react';
import Link from 'next/link';

export const ClauseCard = ({ clause }: { clause: any }) => (
  <div className="border border-slate-700 bg-slate-800 p-4 rounded-lg shadow-sm hover:shadow-md transition">
    <div className="flex justify-between items-start mb-2">
      <PillarTag pillar={clause.pillar} />
      <ConfidenceMeter confidence={clause.confidence} />
    </div>
    <p className="font-mono text-sm text-slate-200 mb-4 line-clamp-3">"{clause.raw_text}"</p>
    <div className="flex flex-wrap gap-2 mb-4">
      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">Type: {clause.clause_type}</span>
      {clause.topics.map((t: string) => (
        <span key={t} className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded">{t}</span>
      ))}
    </div>
    <div className="flex justify-between items-center text-xs text-slate-400">
      <span>{clause.citations?.length || 0} Citations</span>
      <Link href={`/clauses/${clause.id}`} className="text-blue-400 hover:text-blue-300">
        View Audit &rarr;
      </Link>
    </div>
  </div>
);

export const PillarTag = ({ pillar }: { pillar: string }) => {
  const colors = {
    'pillar_6': 'bg-indigo-900 text-indigo-300',
    'pillar_7': 'bg-emerald-900 text-emerald-300',
    'both': 'bg-purple-900 text-purple-300',
    'other': 'bg-slate-700 text-slate-300'
  };
  return <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colors[pillar as keyof typeof colors] || colors.other}`}>{pillar.replace('_', ' ').toUpperCase()}</span>;
};

export const ConfidenceMeter = ({ confidence }: { confidence: number }) => {
  let color = 'bg-red-500';
  if (confidence > 0.8) color = 'bg-green-500';
  else if (confidence > 0.5) color = 'bg-yellow-500';
  
  return (
    <div className="flex items-center gap-2" title={`Confidence: ${(confidence*100).toFixed(1)}%`}>
      <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${confidence * 100}%` }} />
      </div>
      <span className="text-xs text-slate-400">{(confidence*100).toFixed(0)}%</span>
    </div>
  );
};

export const CitationBadge = ({ text }: { text: string }) => (
  <span className="inline-flex items-center gap-1 text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-600">
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    {text}
  </span>
);

export const ConflictAlert = ({ count }: { count: number }) => {
  if (!count) return null;
  return (
    <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg flex items-center gap-3">
      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
      <span><strong>{count} Unresolved Conflicts Detected</strong> — Review required for consistent reporting.</span>
    </div>
  );
};
