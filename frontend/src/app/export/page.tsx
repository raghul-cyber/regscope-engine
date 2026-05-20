"use client";
import React, { useState } from 'react';
import { getExportUrl } from '../../lib/api';
import { PageHeader } from '../../components/Shared';
import { Download } from 'lucide-react';

export default function ExportPage() {
  const [jur, setJur] = useState('all');
  const [pillar, setPillar] = useState('all');
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    setLoading(true);
    const url = getExportUrl(jur, pillar, format);
    const a = document.createElement('a');
    a.href = url;
    a.download = `regscope_export_${jur}_${pillar}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <PageHeader title="Export Center" subtitle="Download compliance data as JSON or CSV" />

      <div className="card space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-faint)]">Jurisdiction</label>
            <select value={jur} onChange={e => setJur(e.target.value)} className="input">
              <option value="all">All Jurisdictions</option>
              <option value="IN">India (DPDP 2023)</option>
              <option value="SG">Singapore (PDPA)</option>
              <option value="EU">European Union (GDPR)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-faint)]">Compliance Pillar</label>
            <select value={pillar} onChange={e => setPillar(e.target.value)} className="input">
              <option value="all">All Pillars</option>
              <option value="pillar_6">Pillar 6 — Cross-Border Transfer</option>
              <option value="pillar_7">Pillar 7 — Security Safeguards</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-faint)]">Export Format</label>
          <div className="flex gap-3">
            {(['json', 'csv'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`flex-1 p-4 rounded-xl border flex items-center gap-3 transition-all cursor-pointer
                  ${format === f
                    ? 'bg-[var(--blue-glow)] border-[rgba(59,130,246,0.3)] text-white'
                    : 'bg-[var(--bg-base)] border-[var(--border-base)] text-[var(--text-muted)] hover:text-white hover:border-[var(--border-hover)]'
                  }`}
              >
                <span className="text-xl">{f === 'json' ? '📄' : '📊'}</span>
                <div className="text-left">
                  <p className="font-bold text-sm uppercase">{f}</p>
                  <p className="text-xs opacity-70">{f === 'json' ? 'Hierarchical' : 'Spreadsheet'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--border-base)]">
          <button onClick={handleDownload} disabled={loading} className="btn btn-primary btn-lg w-full">
            <Download size={17} />
            {loading ? 'Preparing…' : `Download ${format.toUpperCase()} Export`}
          </button>
        </div>
      </div>
    </div>
  );
}
