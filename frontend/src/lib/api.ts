import { JurisdictionStats, SearchResult } from './types';

const API_BASE = 'http://localhost:8000/api/v1';

export async function getJurisdictionStats(): Promise<JurisdictionStats[]> {
  const res = await fetch(`${API_BASE}/jurisdictions/stats`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function searchClauses(query: string): Promise<SearchResult[]> {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  return res.json();
}
