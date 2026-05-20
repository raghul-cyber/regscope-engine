import { JurisdictionStats, SearchResult, ClauseDetail } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function getJurisdictionStats(): Promise<JurisdictionStats[]> {
  try {
    const res = await fetch(`${API_BASE}/jurisdictions/stats`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
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
    const res = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        jurisdictions: jurisdictions?.length ? jurisdictions : undefined,
        pillars: pillars?.length ? pillars : undefined,
        top_k: 20
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching clauses:', error);
    return [];
  }
}

export async function getClauses(params: {
  jurisdiction?: string;
  pillar?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<{ items: any[]; total: number }> {
  try {
    const queryParams = new URLSearchParams();
    if (params.jurisdiction) queryParams.append('jurisdiction', params.jurisdiction);
    if (params.pillar) queryParams.append('pillar', params.pillar);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('page_size', params.pageSize.toString());

    const res = await fetch(`${API_BASE}/clauses?${queryParams.toString()}`, { cache: 'no-store' });
    if (!res.ok) return { items: [], total: 0 };
    return await res.json();
  } catch (error) {
    console.error('Error fetching clauses:', error);
    return { items: [], total: 0 };
  }
}

export async function getClauseDetail(id: string): Promise<ClauseDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/clauses/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Error fetching clause ${id}:`, error);
    return null;
  }
}

export async function triggerCrawl(jurisdictionCode: string, depth: number = 2): Promise<{ success: boolean; message: string; jobId?: string }> {
  try {
    const res = await fetch(`${API_BASE}/crawl/crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jurisdiction_code: jurisdictionCode,
        depth,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.detail || 'Failed to start crawl' };
    }
    return { success: true, message: data.message, jobId: data.job_id };
  } catch (error) {
    console.error('Error triggering crawl:', error);
    return { success: false, message: 'Network error starting crawl' };
  }
}

export async function getAudit(clauseId: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/audit/${clauseId}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
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
    const queryParams = new URLSearchParams();
    if (params.jurisdiction) queryParams.append('jurisdiction', params.jurisdiction);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('page_size', params.pageSize.toString());

    const res = await fetch(`${API_BASE}/documents?${queryParams.toString()}`, { cache: 'no-store' });
    if (!res.ok) return { items: [], total: 0 };
    return await res.json();
  } catch (error) {
    console.error('Error fetching documents:', error);
    return { items: [], total: 0 };
  }
}
