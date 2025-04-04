/**
 * Type definitions for the Subgraph Finder API
 */

// Network type
export interface Network {
  id: string;
  name: string;
}

// Schema type
export interface Schema {
  raw: string;
  description: string;
}

// Subgraph type
export interface Subgraph {
  id: string;
  displayName: string;
  description: string;
  network: string;
  ipfsHash: string;
  schema?: string | Schema;
  contractAddresses?: string[];
}

// Match result type
export interface MatchResult {
  subgraph: Subgraph;
  confidence: number;
  sampleQuery: string;
}

// Match response type
export interface MatchResponse {
  matches: MatchResult[];
  recommendation: string;
}

// Error response type
export interface ErrorResponse {
  error: string;
  code: string;
  message: string;
}
