import React from 'react';
import Link from 'next/link';
import { ConflictAlert } from '../components/Shared';

export default function Dashboard() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-slate-100">RegScope Engine Dashboard</h1>
      
      <ConflictAlert count={3} />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Total Documents</h3>
          <p className="text-3xl font-bold text-slate-100">1,204</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Total Clauses</h3>
          <p className="text-3xl font-bold text-slate-100">18,592</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Jurisdictions</h3>
          <p className="text-3xl font-bold text-slate-100">3</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Pending Reviews</h3>
          <p className="text-3xl font-bold text-amber-500">42</p>
        </div>
      </div>
      
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4 text-slate-200">Quick Actions</h2>
        <div className="flex gap-4">
          <Link href="/clauses" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium">Browse Clauses</Link>
          <Link href="/search" className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-medium">Semantic Search</Link>
          <Link href="/admin/crawl" className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-medium">Manage Crawlers</Link>
        </div>
      </div>
    </div>
  );
}
