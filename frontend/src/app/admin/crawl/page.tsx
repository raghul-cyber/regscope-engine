"use client";
import React, { useState } from 'react';

export default function CrawlManager() {
  const [jobs, setJobs] = useState([
    { id: 'uuid-1', jurisdiction: 'India', status: 'completed', docs: 45, date: '2023-10-25 14:00' },
    { id: 'uuid-2', jurisdiction: 'Singapore', status: 'running', docs: 12, date: '2023-10-25 15:30' },
  ]);

  const triggerCrawl = (code: string) => {
    alert(`Triggering crawl for ${code}`);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-100">Crawl Manager</h1>
      
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden mb-12">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/50 text-slate-400 font-bold uppercase">
            <tr>
              <th className="px-6 py-4">Jurisdiction</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Run</th>
              <th className="px-6 py-4">Docs Found</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {jobs.map(job => (
              <tr key={job.id} className="hover:bg-slate-700/50">
                <td className="px-6 py-4 font-medium text-slate-200">{job.jurisdiction}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${job.status === 'running' ? 'bg-blue-900/50 text-blue-400' : 'bg-green-900/50 text-green-400'}`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4">{job.date}</td>
                <td className="px-6 py-4">{job.docs}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => triggerCrawl(job.jurisdiction)} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-xs font-bold">
                    Trigger Crawl
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
