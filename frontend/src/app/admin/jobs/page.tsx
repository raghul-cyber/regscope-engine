"use client";
import React from 'react';

export default function JobsMonitor() {
  const tasks = [
    { id: 'task-1', name: 'crawl_jurisdiction', status: 'completed', duration: '4m 12s', retries: 0, error: null },
    { id: 'task-2', name: 'run_pipeline', status: 'running', duration: '1m 05s', retries: 0, error: null },
    { id: 'task-3', name: 'run_pipeline', status: 'failed', duration: '0m 45s', retries: 2, error: 'OCRTimeoutError' },
  ];

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Job Queue Monitor</h1>
        <div className="text-sm text-slate-400">Powered by Celery & Redis</div>
      </div>
      
      <div className="flex gap-4 mb-6">
        <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-300 font-bold">All</button>
        <button className="px-4 py-2 bg-slate-900 border border-slate-700 rounded text-slate-500 hover:text-slate-300">Pending</button>
        <button className="px-4 py-2 bg-slate-900 border border-slate-700 rounded text-slate-500 hover:text-slate-300">Running</button>
        <button className="px-4 py-2 bg-slate-900 border border-slate-700 rounded text-slate-500 hover:text-slate-300">Failed</button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/50 text-slate-400 font-bold uppercase">
            <tr>
              <th className="px-6 py-4">Task Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Retries</th>
              <th className="px-6 py-4">Error</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {tasks.map(task => (
              <tr key={task.id} className="hover:bg-slate-700/50">
                <td className="px-6 py-4 font-mono text-blue-300">{task.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs uppercase tracking-wider
                    ${task.status === 'completed' ? 'bg-green-900/50 text-green-400 border border-green-800/50' : 
                      task.status === 'running' ? 'bg-blue-900/50 text-blue-400 border border-blue-800/50' : 
                      'bg-red-900/50 text-red-400 border border-red-800/50'}`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4">{task.duration}</td>
                <td className="px-6 py-4">{task.retries}</td>
                <td className="px-6 py-4 text-red-400 font-mono text-xs">{task.error || '-'}</td>
                <td className="px-6 py-4 text-right">
                  {task.status === 'failed' && (
                    <button className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-wider">
                      Retry
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
