export interface JurisdictionStats {
  name: string;
  code: string;
  doc_count: number;
}

export interface Citation {
  id: string;
  article?: string;
  section_ref?: string;
  page_number?: number;
  verbatim_snippet: string;
  source_url?: string;
  content_hash?: string;
}

export interface Clause {
  id: string;
  raw_text: string;
  pillar: string;
  clause_type: string;
  topics: string[];
  confidence: number;
  flags: string[];
  citations: Citation[];
}

export interface SearchResult {
  clause: Clause;
  score: number;
}

export interface ClauseDetail extends Clause {
  section: {
    heading?: string;
    section_number?: string;
  };
  document: {
    title?: string;
    authority_tier?: string;
  };
}
