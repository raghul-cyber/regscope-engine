export interface JurisdictionStats {
  name: string;
  code: string;
  doc_count: number;
}

export interface SearchResult {
  id: string;
  text: string;
  pillar: string;
  type: string;
  score: number;
  verbatim: string;
}
