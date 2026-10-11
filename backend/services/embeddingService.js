/**
 * CareerOS — Embedding Service Abstraction (Day 10)
 * 
 * Provides a pluggable, deterministic embedding interface supporting:
 * 1. MockEmbeddingProvider: High-performance deterministic TF-IDF unit vector (128-dim).
 * 2. GeminiEmbeddingProvider: Google Gemini text-embedding-004 REST adapter.
 */

const VECTOR_DIMENSION = 128;

/**
 * Computes cosine similarity between two numeric vectors
 * Returns a value between -1.0 and 1.0 (or 0.0 for orthogonal/empty vectors).
 */
export function cosineSimilarity(vecA = [], vecB = []) {
  if (!vecA || !vecB || !vecA.length || !vecB.length) return 0;
  if (vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  const sim = dotProduct / denominator;
  // Clamp between -1 and 1 for floating point rounding
  return Math.max(-1, Math.min(1, sim));
}

/**
 * Simple deterministic FNV-1a hash function for strings
 */
function fnv1a(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Intelligent Mock Embedding Provider for local development, tests, and offline use.
 * Produces normalized 128-dimensional deterministic semantic vectors.
 */
export class MockEmbeddingProvider {
  constructor(config = {}) {
    this.name = 'mock';
    this.dimensions = config.dimensions || VECTOR_DIMENSION;
  }

  /**
   * Generates a 128-dim unit vector for a given text string
   */
  async embed(text = '') {
    const vector = new Array(this.dimensions).fill(0);
    const clean = String(text).toLowerCase();

    // Extract word tokens (length >= 2)
    const tokens = clean.match(/[a-z0-9_#+-]{2,}/g) || [];
    if (!tokens.length) {
      return vector;
    }

    // Weight terms and scatter across dimensions
    for (const token of tokens) {
      const h1 = fnv1a(token) % this.dimensions;
      const h2 = fnv1a(token + '_salt') % this.dimensions;
      const weight = Math.min(3, 1 + token.length * 0.1);

      vector[h1] += weight;
      vector[h2] += weight * 0.5;
    }

    // L2 Normalize vector to unit length so dot product == cosine similarity
    let sumSq = 0;
    for (let i = 0; i < this.dimensions; i++) {
      sumSq += vector[i] * vector[i];
    }

    const norm = Math.sqrt(sumSq);
    if (norm > 0) {
      for (let i = 0; i < this.dimensions; i++) {
        vector[i] = Number((vector[i] / norm).toFixed(6));
      }
    }

    return vector;
  }

  /**
   * Batch embedding generation
   */
  async embedBatch(texts = []) {
    return Promise.all(texts.map(t => this.embed(t)));
  }
}

/**
 * Google Gemini text-embedding-004 REST Adapter
 */
export class GeminiEmbeddingProvider {
  constructor(config = {}) {
    this.name = 'gemini';
    this.apiKey = config.apiKey || process.env.AI_API_KEY || '';
    this.model = config.model || 'text-embedding-004';
    this.dimensions = config.dimensions || 768;
    this.fallbackProvider = new MockEmbeddingProvider();
  }

  async embed(text = '') {
    if (!this.apiKey) {
      console.warn('[GeminiEmbeddingProvider] No API key configured, falling back to mock provider');
      return this.fallbackProvider.embed(text);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:embedContent?key=${this.apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `models/${this.model}`,
          content: {
            parts: [{ text: String(text).slice(0, 8000) }]
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Gemini embed error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const values = data.embedding?.values;
      if (Array.isArray(values) && values.length) {
        return values;
      }
      throw new Error('Invalid embedding response format from Gemini');
    } catch (err) {
      console.warn('[GeminiEmbeddingProvider Error, falling back to mock]:', err.message);
      return this.fallbackProvider.embed(text);
    }
  }

  async embedBatch(texts = []) {
    return Promise.all(texts.map(t => this.embed(t)));
  }
}

/**
 * Factory to get active Embedding Service instance
 */
let cachedEmbeddingService = null;

export function getEmbeddingService() {
  const providerName = (process.env.EMBEDDING_PROVIDER || 'mock').toLowerCase().trim();
  const apiKey = process.env.AI_API_KEY;

  if (cachedEmbeddingService && cachedEmbeddingService.name === providerName) {
    return cachedEmbeddingService;
  }

  if (providerName === 'gemini' && apiKey) {
    cachedEmbeddingService = new GeminiEmbeddingProvider({ apiKey });
    return cachedEmbeddingService;
  }

  cachedEmbeddingService = new MockEmbeddingProvider();
  return cachedEmbeddingService;
}

export default {
  cosineSimilarity,
  MockEmbeddingProvider,
  GeminiEmbeddingProvider,
  getEmbeddingService
};
