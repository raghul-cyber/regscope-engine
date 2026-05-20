import { JurisdictionStats, SearchResult, ClauseDetail } from './types';

// Use a proxy route to avoid CORS issues in production (Vercel → HF Space)
const IS_SERVER = typeof window === 'undefined';

function getApiBase() {
  if (IS_SERVER) {
    // Server-side: hit the external URL directly
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
  }
  // Client-side: go through Next.js proxy to avoid CORS
  return '/api/proxy';
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const base = getApiBase();
  const url = `${base}${path}`;
  
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`API error ${res.status}: ${text}`);
  }

  // Handle empty responses (204, etc.)
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return res as unknown as T;
  }
  return res.json();
}

export async function getJurisdictionStats(): Promise<JurisdictionStats[]> {
  try {
    return await apiFetch<JurisdictionStats[]>('/jurisdictions/stats');
  } catch (error) {
    console.error('Error fetching jurisdiction stats:', error);
    return [];
  }
}

export async function searchClauses(
  query: string,
  jurisdictions?: string[],
  pillars?: string[]
): Promise<SearchResult[]> {
  try {
    const data = await apiFetch<{ results: SearchResult[] }>('/search', {
      method: 'POST',
      body: JSON.stringify({
        query,
        jurisdictions: jurisdictions?.length ? jurisdictions : undefined,
        pillars: pillars?.length ? pillars : undefined,
        top_k: 20,
      }),
    });
    return data.results || [];
  } catch (error) {
    console.error('Error searching clauses:', error);
    return [];
  }
}

export async function getClauses(params: {
  jurisdiction?: string;
  pillar?: string;
  clause_type?: string;
  topic?: string;
  confidence_min?: number;
  page?: number;
  pageSize?: number;
} = {}): Promise<{ items: any[]; total: number }> {
  try {
    const q = new URLSearchParams();
    if (params.jurisdiction)   q.append('jurisdiction',   params.jurisdiction);
    if (params.pillar)         q.append('pillar',         params.pillar);
    if (params.clause_type)    q.append('clause_type',    params.clause_type);
    if (params.topic)          q.append('topic',          params.topic);
    if (params.confidence_min != null) q.append('confidence_min', String(params.confidence_min));
    if (params.page)           q.append('page',      String(params.page));
    if (params.pageSize)       q.append('page_size', String(params.pageSize));

    return await apiFetch<{ items: any[]; total: number }>(`/clauses?${q.toString()}`);
  } catch (error) {
    console.error('Error fetching clauses:', error);
    return { items: [], total: 0 };
  }
}

export async function getClauseDetail(id: string): Promise<ClauseDetail | null> {
  try {
    return await apiFetch<ClauseDetail>(`/clauses/${id}`);
  } catch (error) {
    console.error(`Error fetching clause ${id}:`, error);
    return null;
  }
}

export async function triggerCrawl(
  jurisdictionCode: string,
  depth: number = 2
): Promise<{ success: boolean; message: string; jobId?: string }> {
  try {
    const data = await apiFetch<{ job_id: string; status: string; message: string }>('/crawl/crawl', {
      method: 'POST',
      body: JSON.stringify({ jurisdiction_code: jurisdictionCode, depth }),
    });
    return { success: true, message: data.message, jobId: data.job_id };
  } catch (error: any) {
    console.error('Error triggering crawl:', error);
    return { success: false, message: error?.message || 'Failed to start crawl job' };
  }
}

export async function getJobStatus(jobId: string): Promise<any | null> {
  try {
    return await apiFetch<any>(`/crawl/jobs/${jobId}`);
  } catch (error) {
    console.error(`Error fetching job ${jobId}:`, error);
    return null;
  }
}

export async function getAudit(clauseId: string): Promise<any | null> {
  try {
    return await apiFetch<any>(`/audit/${clauseId}`);
  } catch (error) {
    console.error(`Error fetching audit for clause ${clauseId}:`, error);
    return null;
  }
}

export async function getDocuments(params: {
  jurisdiction?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<{ items: any[]; total: number }> {
  try {
    const q = new URLSearchParams();
    if (params.jurisdiction) q.append('jurisdiction', params.jurisdiction);
    if (params.page)         q.append('page',      String(params.page));
    if (params.pageSize)     q.append('page_size', String(params.pageSize));
    return await apiFetch<{ items: any[]; total: number }>(`/documents?${q.toString()}`);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return { items: [], total: 0 };
  }
}

export function getExportUrl(jurisdiction?: string, pillar?: string, format: 'json' | 'csv' = 'json'): string {
  const base = getApiBase();
  const q = new URLSearchParams({ format });
  if (jurisdiction && jurisdiction !== 'all') q.append('jurisdiction', jurisdiction);
  if (pillar && pillar !== 'all')             q.append('pillar', pillar);
  return `${base}/export?${q.toString()}`;
}
