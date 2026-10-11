import mongoose from 'mongoose';
import KnowledgeChunk from '../models/KnowledgeChunk.js';
import { memoryKnowledgeChunks } from '../data/store.js';
import { getEmbeddingService, cosineSimilarity } from './embeddingService.js';

/**
 * CareerOS — Knowledge Retrieval Service (Day 10)
 * 
 * Provides vector similarity search, lexical keyword re-ranking,
 * and multi-attribute metadata filtering across indexed CareerOS materials.
 */

export const DEFAULT_SEARCH_LIMIT = 4;
export const DEFAULT_MIN_RELEVANCE_SCORE = 0.25;

export class KnowledgeRetriever {
  /**
   * Search knowledge base using query text, contextual filters, and relevance threshold
   */
  static async search({
    query = '',
    filters = {},
    limit = DEFAULT_SEARCH_LIMIT,
    minScore = DEFAULT_MIN_RELEVANCE_SCORE
  } = {}) {
    const trimmedQuery = String(query).trim();
    if (!trimmedQuery) {
      return {
        chunks: [],
        totalCandidates: 0,
        isGrounded: false,
        reason: 'Empty query'
      };
    }

    const isDbConnected = mongoose.connection.readyState === 1;
    const embeddingService = getEmbeddingService();
    const queryEmbedding = await embeddingService.embed(trimmedQuery);

    // Build database query filters (enforce published content only)
    const dbFilter = {
      status: 'published'
    };

    if (filters.career) {
      dbFilter.career = String(filters.career).toLowerCase().trim();
    }
    if (filters.module) {
      dbFilter.module = String(filters.module).toLowerCase().trim();
    }
    if (filters.subject) {
      dbFilter.subject = new RegExp(filters.subject, 'i');
    }
    if (filters.topic) {
      dbFilter.topic = new RegExp(filters.topic, 'i');
    }
    if (filters.sourceType) {
      dbFilter.sourceType = String(filters.sourceType).toLowerCase().trim();
    }
    if (filters.language) {
      dbFilter.language = String(filters.language).trim();
    }

    let candidateChunks = [];

    if (isDbConnected) {
      try {
        candidateChunks = await KnowledgeChunk.find(dbFilter).lean();

        // If strict module filter produced zero candidates, loosen module filter but keep career filter
        if (candidateChunks.length === 0 && filters.module && filters.career) {
          const fallbackFilter = {
            status: 'published',
            career: String(filters.career).toLowerCase().trim()
          };
          candidateChunks = await KnowledgeChunk.find(fallbackFilter).lean();
        }
      } catch (err) {
        console.warn('[KnowledgeRetriever DB Search Error, falling back to memory]:', err.message);
        candidateChunks = [];
      }
    }

    // In-memory fallback
    if (!candidateChunks.length) {
      candidateChunks = memoryKnowledgeChunks.filter(c => {
        if (c.status !== 'published') return false;
        if (filters.career && c.career !== String(filters.career).toLowerCase().trim()) return false;
        if (filters.module && c.module !== String(filters.module).toLowerCase().trim()) {
          // Allow fallback if no candidates match specific module
          return false;
        }
        if (filters.sourceType && c.sourceType !== String(filters.sourceType).toLowerCase().trim()) return false;
        return true;
      });

      // If strict filter yielded empty in memory, loosen module
      if (!candidateChunks.length && filters.career) {
        candidateChunks = memoryKnowledgeChunks.filter(c => 
          c.status === 'published' && c.career === String(filters.career).toLowerCase().trim()
        );
      }
    }

    if (!candidateChunks.length) {
      return {
        chunks: [],
        totalCandidates: 0,
        isGrounded: false,
        reason: 'No published content matched filters'
      };
    }

    // Tokenize query for hybrid lexical re-ranking
    const queryTokens = (trimmedQuery.toLowerCase().match(/[a-z0-9_#+-]{3,}/g) || []);

    // Score candidates using vector cosine similarity + lexical bonus
    const scoredChunks = candidateChunks.map(chunk => {
      let sim = 0;
      if (Array.isArray(chunk.embedding) && chunk.embedding.length) {
        sim = cosineSimilarity(queryEmbedding, chunk.embedding);
      }

      // Lexical keyword match bonus (hybrid search)
      let lexicalBonus = 0;
      const titleLower = (chunk.title || '').toLowerCase();
      const topicLower = (chunk.topic || '').toLowerCase();
      const contentLower = (chunk.content || '').toLowerCase();
      const tagsLower = (chunk.tags || []).map(t => t.toLowerCase());

      for (const token of queryTokens) {
        if (titleLower.includes(token)) lexicalBonus += 0.08;
        if (topicLower.includes(token)) lexicalBonus += 0.06;
        if (tagsLower.some(t => t.includes(token))) lexicalBonus += 0.05;
        if (contentLower.includes(token)) lexicalBonus += 0.03;
      }

      const combinedScore = Math.min(1.0, Number((sim * 0.75 + Math.min(0.25, lexicalBonus)).toFixed(4)));

      return {
        chunkId: chunk.chunkId,
        resourceId: chunk.resourceId,
        resourceSlug: chunk.resourceSlug,
        title: chunk.title,
        content: chunk.content,
        sourceType: chunk.sourceType,
        career: chunk.career,
        phase: chunk.phase,
        subject: chunk.subject,
        module: chunk.module,
        topic: chunk.topic,
        tags: chunk.tags || [],
        language: chunk.language || 'English',
        score: combinedScore,
        rawSimilarity: Number(sim.toFixed(4)),
        sourceLabel: formatSourceLabel(chunk),
        url: `/learn/${chunk.career}/${chunk.module}?resource=${chunk.resourceSlug || chunk.resourceId}`
      };
    });

    // Filter by relevance threshold and sort descending by score
    const passingChunks = scoredChunks
      .filter(c => c.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return {
      chunks: passingChunks,
      totalCandidates: candidateChunks.length,
      isGrounded: passingChunks.length > 0,
      query: trimmedQuery,
      minScore
    };
  }
}

/**
 * Format a human-friendly citation label for retrieved resources
 */
export function formatSourceLabel(chunk) {
  const parts = [];
  if (chunk.career) {
    parts.push(chunk.career.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
  }
  if (chunk.module) {
    parts.push(chunk.module.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
  }
  if (chunk.title) {
    parts.push(chunk.title);
  }
  const typeTag = chunk.sourceType ? ` (${chunk.sourceType.toUpperCase()})` : '';
  return parts.join(' → ') + typeTag;
}

export default KnowledgeRetriever;
