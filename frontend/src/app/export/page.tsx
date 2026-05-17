"use client";
import React from 'react';

export default function ExportPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-100">Export Center</h1>
      
      <div className="max-w-2xl bg-slate-800 border border-slate-700 p-8 rounded-lg">
        <h2 className="text-xl font-bold mb-6 text-slate-200">Configure Export</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Jurisdiction Filter</label>
            <select className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-3 text-slate-200">
              <option value="all">All Jurisdictions</option>
              <option value="IN">India</option>
              <option value="SG">Singapore</option>
              <option value="EU">European Union</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Pillar Filter</label>
            <select className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-3 text-slate-200">
              <option value="all">All Pillars</option>
              <option value="pillar_6">Pillar 6 (Cross-Border Transfer)</option>
              <option value="pillar_7">Pillar 7 (Domestic Safeguards)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Export Format</label>
            <div className="flex gap-4">
              <label className="flex-1 border border-slate-600 bg-slate-900 rounded p-4 flex items-center gap-3 cursor-pointer hover:border-blue-500">
                <input type="radio" name="format" value="json" defaultChecked className="w-4 h-4" />
                <span className="font-bold text-slate-200">JSON</span>
              </label>
              <label className="flex-1 border border-slate-600 bg-slate-900 rounded p-4 flex items-center gap-3 cursor-pointer hover:border-blue-500">
                <input type="radio" name="format" value="csv" className="w-4 h-4" />
                <span className="font-bold text-slate-200">CSV</span>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg text-lg flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download Export
            </button>
            <p className="text-center text-slate-500 text-sm mt-3">Estimated records: 1,204</p>
          </div>
        </div>
      </div>
    </div>
  );
}
