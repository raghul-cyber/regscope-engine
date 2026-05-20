"use client";
import React, { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export default function ExportPage() {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');
  const [selectedPillar, setSelectedPillar] = useState('all');
  const [format, setFormat] = useState('json');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedJurisdiction !== 'all') queryParams.append('jurisdiction', selectedJurisdiction);
      if (selectedPillar !== 'all') queryParams.append('pillar', selectedPillar);
      queryParams.append('format', format);

      const downloadUrl = `${API_BASE}/export?${queryParams.toString()}`;
      
      // Perform direct download using link element
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `regscope_export_${selectedJurisdiction}_${selectedPillar}.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Error downloading export:', e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#c9d1d9] to-[#8b949e] bg-clip-text text-transparent">
          Export Center
        </h1>
        <p className="text-[#8b949e] mt-2">
          Configure and export regulatory data compliance mappings in structured JSON or CSV format.
        </p>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] p-8 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-xl font-bold text-white pb-3 border-b border-[#30363d]/60">Configure Export File</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#8b949e] uppercase">Jurisdiction</label>
            <select 
              value={selectedJurisdiction}
              onChange={(e) => setSelectedJurisdiction(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#58a6ff]"
            >
              <option value="all">All Jurisdictions</option>
              <option value="IN">India (DPDP 2023)</option>
              <option value="SG">Singapore (PDPA)</option>
              <option value="EU">European Union (GDPR)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#8b949e] uppercase">Compliance Pillar</label>
            <select 
              value={selectedPillar}
              onChange={(e) => setSelectedPillar(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#58a6ff]"
            >
              <option value="all">All Pillars</option>
              <option value="pillar_6">Pillar 6 (Cross-Border Transfer)</option>
              <option value="pillar_7">Pillar 7 (Data Protection & Security)</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-[#8b949e] uppercase block">Export Format</label>
          <div className="flex gap-4">
            <label className={`flex-1 border p-4 rounded-xl flex items-center gap-3 cursor-pointer select-none transition-all ${
              format === 'json' 
                ? 'bg-[#58a6ff]/10 border-[#58a6ff] text-white' 
                : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-white'
            }`}>
              <input 
                type="radio" 
                name="format" 
                value="json" 
                checked={format === 'json'}
                onChange={() => setFormat('json')}
                className="hidden" 
              />
              <span className="text-xl">📄</span>
              <div>
                <p className="font-bold text-sm">JSON Format</p>
                <p className="text-xs opacity-75">Hierarchical nested structure</p>
              </div>
            </label>

            <label className={`flex-1 border p-4 rounded-xl flex items-center gap-3 cursor-pointer select-none transition-all ${
              format === 'csv' 
                ? 'bg-[#58a6ff]/10 border-[#58a6ff] text-white' 
                : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-white'
            }`}>
              <input 
                type="radio" 
                name="format" 
                value="csv" 
                checked={format === 'csv'}
                onChange={() => setFormat('csv')}
                className="hidden" 
              />
              <span className="text-xl">📊</span>
              <div>
                <p className="font-bold text-sm">CSV / Spreadsheet</p>
                <p className="text-xs opacity-75">Flattened rows, compatible with Excel</p>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-6 border-t border-[#30363d]/60">
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="w-full bg-[#58a6ff] hover:bg-[#58a6ff]/90 disabled:opacity-50 text-slate-950 font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#58a6ff]/20 transition"
          >
            <span className="text-xl">📥</span>
            {downloading ? 'Preparing Download...' : 'Download Export File'}
          </button>
        </div>
      </div>
    </div>
  );
}
