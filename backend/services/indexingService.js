import mongoose from 'mongoose';
import KnowledgeChunk from '../models/KnowledgeChunk.js';
import Resource from '../models/Resource.js';
import { memoryKnowledgeChunks, memoryResources } from '../data/store.js';
import { extractResourceText, chunkContent, computeContentHash } from './chunkingService.js';
import { getEmbeddingService } from './embeddingService.js';

/**
 * CareerOS — Knowledge Indexing Service (Day 10)
 * 
 * Manages the extraction, cleaning, chunking, embedding, and storage
 * of CareerOS learning resources into the RAG knowledge base.
 */

/**
 * Index a single CareerOS Resource document into the Knowledge Base
 */
export async function indexResource(resource, options = {}) {
  if (!resource) {
    throw new Error('Resource object is required for indexing');
  }

  const resourceId = String(resource._id || resource.id);
  const isDbConnected = mongoose.connection.readyState === 1;

  // Rule: Only published resources are permitted into the learner knowledge base.
  // If resource is draft, review, or archived, remove from index immediately.
  if (resource.status !== 'published') {
    await removeResourceFromIndex(resourceId);
    return {
      success: true,
      resourceId,
      status: resource.status,
      action: 'removed',
      reason: 'Resource is not in published status'
    };
  }

  // 1. Extract and clean text from resource
  const extractedText = extractResourceText(resource);
  if (!extractedText.trim()) {
    await removeResourceFromIndex(resourceId);
    return {
      success: true,
      resourceId,
      action: 'skipped',
      reason: 'No indexable text content in resource'
    };
  }

  const overallHash = computeContentHash(extractedText);

  // 2. Duplicate / Staleness check: check if already indexed with identical hash
  if (!options.force) {
    let existingChunks = [];
    if (isDbConnected) {
      existingChunks = await KnowledgeChunk.find({ resourceId }).limit(1).lean();
    } else {
      existingChunks = memoryKnowledgeChunks.filter(c => c.resourceId === resourceId);
    }

    if (existingChunks.length && existingChunks[0].contentHash === overallHash) {
      return {
        success: true,
        resourceId,
        action: 'skipped',
        reason: 'Content unchanged (hash match)'
      };
    }
  }

  // 3. Chunk the content into semantic units
  const rawChunks = chunkContent(extractedText, {
    maxChunkSize: options.maxChunkSize,
    chunkOverlap: options.chunkOverlap
  });

  if (!rawChunks.length) {
    return {
      success: true,
      resourceId,
      action: 'skipped',
      reason: 'Chunking produced no content blocks'
    };
  }

  // 4. Generate embeddings in batch
  const embeddingService = getEmbeddingService();
  const embeddings = await embeddingService.embedBatch(rawChunks.map(c => c.text));

  // 5. Construct KnowledgeChunk records
  const newChunks = rawChunks.map((c, idx) => ({
    chunkId: `${resourceId}_chunk_${c.chunkIndex}`,
    title: resource.title,
    content: c.text,
    sourceType: resource.type,
    resourceId,
    resourceSlug: resource.slug || resourceId,
    career: String(resource.career).toLowerCase().trim(),
    phase: resource.phase || 1,
    subject: resource.subject || '',
    module: String(resource.module).toLowerCase().trim(),
    topic: resource.topic || '',
    tags: resource.tags || [],
    language: resource.language || 'English',
    chunkIndex: c.chunkIndex,
    totalChunks: c.totalChunks,
    embedding: embeddings[idx] || [],
    contentHash: overallHash,
    version: resource.version || 1,
    status: resource.status || 'published',
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  // 6. Atomically replace previous chunks for this resource
  if (isDbConnected) {
    try {
      await KnowledgeChunk.deleteMany({ resourceId });
      await KnowledgeChunk.insertMany(newChunks);
    } catch (err) {
      console.warn('[IndexingService DB Error, falling back to memory]:', err.message);
    }
  }

  // Also maintain in-memory fallback
  const filteredMemory = memoryKnowledgeChunks.filter(c => c.resourceId !== resourceId);
  memoryKnowledgeChunks.length = 0;
  memoryKnowledgeChunks.push(...filteredMemory, ...newChunks);

  return {
    success: true,
    resourceId,
    action: 'indexed',
    chunksIndexed: newChunks.length
  };
}

/**
 * Remove a resource from the Knowledge Base (e.g. on unpublish, archive, or deletion)
 */
export async function removeResourceFromIndex(resourceId) {
  if (!resourceId) return { success: false };

  const idStr = String(resourceId);
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      await KnowledgeChunk.deleteMany({ resourceId: idStr });
    } catch (err) {
      console.warn('[removeResourceFromIndex DB Error]:', err.message);
    }
  }

  const remaining = memoryKnowledgeChunks.filter(c => c.resourceId !== idStr);
  memoryKnowledgeChunks.length = 0;
  memoryKnowledgeChunks.push(...remaining);

  return { success: true, resourceId: idStr, action: 'removed' };
}

/**
 * Reindexes all published resources matching optional career / module filter
 */
export async function reindexAll({ career, module: modSlug, force = false } = {}) {
  const isDbConnected = mongoose.connection.readyState === 1;
  let resourcesToIndex = [];

  const query = { status: 'published' };
  if (career) query.career = String(career).toLowerCase().trim();
  if (modSlug) query.module = String(modSlug).toLowerCase().trim();

  if (isDbConnected) {
    try {
      resourcesToIndex = await Resource.find(query).lean();
    } catch (err) {
      console.warn('[reindexAll DB Find Error]:', err.message);
    }
  }

  if (!resourcesToIndex.length) {
    resourcesToIndex = memoryResources.filter(r => {
      if (r.status !== 'published') return false;
      if (career && r.career !== String(career).toLowerCase().trim()) return false;
      if (modSlug && r.module !== String(modSlug).toLowerCase().trim()) return false;
      return true;
    });
  }

  let totalProcessed = 0;
  let totalChunksIndexed = 0;
  const errors = [];

  for (const resource of resourcesToIndex) {
    try {
      const res = await indexResource(resource, { force });
      if (res.chunksIndexed) {
        totalChunksIndexed += res.chunksIndexed;
      }
      totalProcessed++;
    } catch (err) {
      errors.push({ resourceId: resource._id, title: resource.title, error: err.message });
    }
  }

  return {
    success: true,
    totalResourcesFound: resourcesToIndex.length,
    totalProcessed,
    totalChunksIndexed,
    errors
  };
}

/**
 * Get statistical status of the knowledge index
 */
export async function getKnowledgeStatus() {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const [totalChunks, totalResources, distinctCareers, typeCounts] = await Promise.all([
        KnowledgeChunk.countDocuments({ status: 'published' }),
        KnowledgeChunk.distinct('resourceId', { status: 'published' }),
        KnowledgeChunk.distinct('career', { status: 'published' }),
        KnowledgeChunk.aggregate([
          { $match: { status: 'published' } },
          { $group: { _id: '$sourceType', count: { $sum: 1 } } }
        ])
      ]);

      const breakdown = {};
      typeCounts.forEach(t => { breakdown[t._id] = t.count; });

      return {
        totalChunks,
        totalResourcesIndexed: totalResources.length,
        careersIndexed: distinctCareers,
        breakdown,
        storage: 'mongodb'
      };
    } catch (err) {
      console.warn('[getKnowledgeStatus DB Error, returning memory stats]:', err.message);
    }
  }

  // Memory stats
  const publishedChunks = memoryKnowledgeChunks.filter(c => c.status === 'published');
  const distinctResources = new Set(publishedChunks.map(c => c.resourceId));
  const distinctCareers = [...new Set(publishedChunks.map(c => c.career))];

  const breakdown = {};
  publishedChunks.forEach(c => {
    breakdown[c.sourceType] = (breakdown[c.sourceType] || 0) + 1;
  });

  return {
    totalChunks: publishedChunks.length,
    totalResourcesIndexed: distinctResources.size,
    careersIndexed: distinctCareers,
    breakdown,
    storage: 'memory'
  };
}

export default {
  indexResource,
  removeResourceFromIndex,
  reindexAll,
  getKnowledgeStatus
};
