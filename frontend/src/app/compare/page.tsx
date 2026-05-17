"use client";
import React from 'react';

export default function ComparePage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-100">Jurisdiction Comparison</h1>
      
      <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg mb-8 flex gap-6 items-end">
        <div className="flex-1">
          <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Topic</label>
          <select className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-slate-200">
            <option>Cross-Border Data Transfer (Pillar 6)</option>
            <option>Data Security Safeguards (Pillar 7)</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Jurisdiction A</label>
          <select className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-slate-200">
            <option>India (DPDP 2023)</option>
            <option>Singapore (PDPA)</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Jurisdiction B</label>
          <select className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-slate-200">
            <option>EU (GDPR)</option>
            <option>Singapore (PDPA)</option>
          </select>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold h-10">Compare</button>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-200 mb-4 pb-2 border-b border-slate-800">India (DPDP 2023)</h2>
          <div className="space-y-4">
            <div className="p-4 bg-slate-800 rounded border border-slate-700">
              <span className="text-xs bg-red-900/50 text-red-400 px-2 py-1 rounded mb-2 inline-block">PROHIBITION</span>
              <p className="text-slate-300 font-mono text-sm">"The Central Government may, by notification, restrict the transfer of personal data by a Data Fiduciary to any country or territory outside India."</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-200 mb-4 pb-2 border-b border-slate-800">EU (GDPR)</h2>
          <div className="space-y-4">
            <div className="p-4 bg-slate-800 rounded border border-slate-700">
              <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded mb-2 inline-block">PERMISSION (CONDITIONAL)</span>
              <p className="text-slate-300 font-mono text-sm">"A transfer of personal data to a third country or an international organisation may take place where the Commission has decided that the third country... ensures an adequate level of protection."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
