import express from 'express';
import mongoose from 'mongoose';
import Resource from '../models/Resource.js';
import { memoryResources } from '../data/store.js';
import { RESOURCES_SEED } from '../data/resourcesSeedData.js';
import { 
  checkDuplicateVideo, 
  checkDuplicateSlug, 
  normalizeResourceData, 
  ingestResourcePipeline,
  STATUS_TRANSITIONS 
} from '../services/contentService.js';
import { 
  indexResource, 
  removeResourceFromIndex, 
  reindexAll 
} from '../services/indexingService.js';
import KnowledgeChunk from '../models/KnowledgeChunk.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Auto-seed resources in MongoDB if collection is empty, and ensure RAG index is populated
 */
async function ensureResourcesSeeded() {
  if (mongoose.connection.readyState === 1) {
    try {
      const count = await Resource.countDocuments();
      if (count === 0) {
        console.log('[CareerOS Content Engine]: Seeding initial learning resources into MongoDB...');
        await Resource.insertMany(RESOURCES_SEED);
        console.log(`[CareerOS Content Engine]: Successfully seeded ${RESOURCES_SEED.length} resources.`);
        await reindexAll();
      } else {
        const chunkCount = await KnowledgeChunk.countDocuments({ status: 'published' }).catch(() => 0);
        if (chunkCount === 0) {
          console.log('[CareerOS RAG Knowledge Base]: Indexing initial knowledge chunks...');
          await reindexAll().catch(e => console.warn('[RAG Indexing Warning]:', e.message));
        }
      }
    } catch (err) {
      console.warn('[CareerOS Content Engine]: Auto-seed error:', err.message);
    }
  }
}

/**
 * @route   GET /api/resources
 * @desc    Get resources with filtering (career, module, type, difficulty, status, search)
 * @access  Public (Learners only see published; admin can filter by status)
 */
router.get('/', async (req, res) => {
  try {
    const { 
      career, 
      module: moduleSlug, 
      subject, 
      phase, 
      type, 
      difficulty, 
      language, 
      status, 
      tags, 
      search, 
      sort = 'order' 
    } = req.query || {};

    let resourcesList = [];

    // Learners default to published status only
    const targetStatus = status || 'published';

    if (mongoose.connection.readyState === 1) {
      await ensureResourcesSeeded();

      const filter = {};
      if (targetStatus && targetStatus !== 'all') {
        filter.status = targetStatus;
      }
      if (career) {
        filter.career = career.toLowerCase().trim();
      }
      if (moduleSlug) {
        filter.module = moduleSlug.toLowerCase().trim();
      }
      if (subject) {
        filter.subject = subject.trim();
      }
      if (phase) {
        filter.phase = Number(phase);
      }
      if (type && type !== 'all') {
        filter.type = type.toLowerCase().trim();
      }
      if (difficulty && difficulty.toLowerCase() !== 'all') {
        filter.difficulty = new RegExp(`^${difficulty.trim()}$`, 'i');
      }
      if (language) {
        filter.language = language;
      }
      if (tags) {
        const tagList = Array.isArray(tags) ? tags : [tags];
        filter.tags = { $in: tagList };
      }
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [
          { title: regex },
          { description: regex },
          { tags: { $in: [regex] } },
          { topic: regex }
        ];
      }

      const sortOption = sort === 'duration' ? { durationMinutes: 1 } : { order: 1, createdAt: 1 };
      resourcesList = await Resource.find(filter).sort(sortOption).lean();
    } else {
      // In-memory fallback
      resourcesList = memoryResources;

      if (targetStatus && targetStatus !== 'all') {
        resourcesList = resourcesList.filter(r => (r.status || 'published') === targetStatus);
      }
      if (career) {
        resourcesList = resourcesList.filter(r => r.career?.toLowerCase() === career.toLowerCase().trim());
      }
      if (moduleSlug) {
        resourcesList = resourcesList.filter(r => r.module?.toLowerCase() === moduleSlug.toLowerCase().trim());
      }
      if (subject) {
        resourcesList = resourcesList.filter(r => r.subject === subject.trim());
      }
      if (phase) {
        resourcesList = resourcesList.filter(r => Number(r.phase) === Number(phase));
      }
      if (type && type !== 'all') {
        resourcesList = resourcesList.filter(r => r.type === type.toLowerCase().trim());
      }
      if (difficulty && difficulty !== 'All') {
        resourcesList = resourcesList.filter(r => r.difficulty === difficulty);
      }
      if (language) {
        resourcesList = resourcesList.filter(r => r.language === language);
      }
      if (tags) {
        const tagList = Array.isArray(tags) ? tags : [tags];
        resourcesList = resourcesList.filter(r => (r.tags || []).some(t => tagList.includes(t)));
      }
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        resourcesList = resourcesList.filter(r =>
          r.title?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          (r.tags || []).some(t => t.toLowerCase().includes(q))
        );
      }

      resourcesList.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    return res.status(200).json({
      success: true,
      count: resourcesList.length,
      resources: resourcesList.map(r => ({
        ...r,
        id: r._id ? r._id.toString() : r.id || r.slug,
        platform: r.platform || r.videoMetadata?.platform || (r.type === 'video' ? 'youtube' : undefined),
        videoId: r.videoId || r.videoMetadata?.videoId || '',
        provider: r.provider || r.videoMetadata?.channel || r.source || 'CareerOS Academy',
        channel: r.channel || r.videoMetadata?.channel || r.source || 'CareerOS Academy'
      }))
    });
  } catch (error) {
    console.error('[Resources API Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch learning resources',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/resources/:id
 * @desc    Get resource by ID or slug
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let resource = null;

    if (mongoose.connection.readyState === 1) {
      await ensureResourcesSeeded();
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      if (isObjectId) {
        resource = await Resource.findById(id).lean();
      }
      if (!resource) {
        resource = await Resource.findOne({ slug: id.toLowerCase() }).lean();
      }
    } else {
      resource = memoryResources.find(r => 
        (r._id && String(r._id) === id) || 
        r.id === id || 
        r.slug === id.toLowerCase()
      );
    }

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: `Resource with identifier "${id}" not found`
      });
    }

    return res.status(200).json({
      success: true,
      resource: {
        ...resource,
        id: resource._id ? resource._id.toString() : resource.id || resource.slug,
        platform: resource.platform || resource.videoMetadata?.platform || (resource.type === 'video' ? 'youtube' : undefined),
        videoId: resource.videoId || resource.videoMetadata?.videoId || '',
        provider: resource.provider || resource.videoMetadata?.channel || resource.source || 'CareerOS Academy',
        channel: resource.channel || resource.videoMetadata?.channel || resource.source || 'CareerOS Academy'
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve resource',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/resources
 * @desc    Create a new learning resource (admin / author)
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const rawData = req.body || {};

    // Validate required fields
    if (!rawData.title || !String(rawData.title).trim()) {
      return res.status(400).json({ success: false, message: 'Resource title is required' });
    }
    if (!rawData.career || !String(rawData.career).trim()) {
      return res.status(400).json({ success: false, message: 'Target career slug is required' });
    }
    if (!rawData.module || !String(rawData.module).trim()) {
      return res.status(400).json({ success: false, message: 'Target module slug is required' });
    }

    const normalized = normalizeResourceData(rawData);

    // Duplicate check for video
    if (normalized.type === 'video' && normalized.videoMetadata?.videoId) {
      const isDup = await checkDuplicateVideo(
        normalized.videoMetadata.platform,
        normalized.videoMetadata.videoId
      );
      if (isDup) {
        return res.status(409).json({
          success: false,
          message: `Duplicate video detected: ${normalized.videoMetadata.platform} videoId "${normalized.videoMetadata.videoId}" already exists in the content library.`
        });
      }
    }

    // Duplicate slug check within module
    const isDupSlug = await checkDuplicateSlug(normalized.career, normalized.module, normalized.slug);
    if (isDupSlug) {
      return res.status(409).json({
        success: false,
        message: `Resource with slug "${normalized.slug}" already exists in module "${normalized.module}".`
      });
    }

    let createdResource = null;

    if (mongoose.connection.readyState === 1) {
      const doc = new Resource(normalized);
      await doc.save();
      createdResource = doc.toJSON ? doc.toJSON() : doc;
      if (doc.status === 'published') {
        indexResource(doc).catch(e => console.warn('[AutoIndex Error]:', e.message));
      }
    } else {
      createdResource = {
        ...normalized,
        id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryResources.push(createdResource);
      if (createdResource.status === 'published') {
        indexResource(createdResource).catch(e => console.warn('[AutoIndex Error]:', e.message));
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Learning resource created successfully',
      resource: createdResource
    });
  } catch (error) {
    console.error('[Create Resource Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create learning resource',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/resources/:id
 * @desc    Update resource metadata or lifecycle status
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};

    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      let doc = isObjectId ? await Resource.findById(id) : null;
      if (!doc) doc = await Resource.findOne({ slug: id.toLowerCase() });

      if (!doc) {
        return res.status(404).json({ success: false, message: `Resource "${id}" not found` });
      }

      // Validate lifecycle status transition if changing
      if (updates.status && updates.status !== doc.status) {
        const allowed = STATUS_TRANSITIONS[doc.status] || [];
        if (!allowed.includes(updates.status)) {
          return res.status(400).json({
            success: false,
            message: `Invalid status transition from "${doc.status}" to "${updates.status}". Permitted: ${allowed.join(', ')}`
          });
        }
      }

      // Check duplicate videoId if updated
      if (updates.videoMetadata?.videoId && updates.videoMetadata.videoId !== doc.videoMetadata?.videoId) {
        const isDup = await checkDuplicateVideo(
          updates.videoMetadata.platform || doc.videoMetadata.platform,
          updates.videoMetadata.videoId,
          doc._id
        );
        if (isDup) {
          return res.status(409).json({ success: false, message: 'Duplicate videoId already exists in library' });
        }
      }

      const normalized = normalizeResourceData({ ...doc.toObject(), ...updates });
      Object.assign(doc, normalized);
      await doc.save();

      // Maintain RAG index
      indexResource(doc).catch(e => console.warn('[AutoIndex Update Error]:', e.message));

      return res.status(200).json({
        success: true,
        message: 'Resource updated successfully',
        resource: doc.toJSON ? doc.toJSON() : doc
      });
    }

    // In-memory fallback
    const idx = memoryResources.findIndex(r => 
      (r._id && String(r._id) === id) || 
      r.id === id || 
      r.slug === id.toLowerCase()
    );

    if (idx === -1) {
      return res.status(404).json({ success: false, message: `Resource "${id}" not found` });
    }

    const current = memoryResources[idx];
    if (updates.status && updates.status !== current.status) {
      const allowed = STATUS_TRANSITIONS[current.status] || [];
      if (!allowed.includes(updates.status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition from "${current.status}" to "${updates.status}"`
        });
      }
    }

    const updated = normalizeResourceData({ ...current, ...updates, updatedAt: new Date().toISOString() });
    memoryResources[idx] = updated;

    return res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      resource: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update resource',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/resources/:id
 * @desc    Soft-archive or permanently delete resource
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { hard = false } = req.query;

    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId ? { _id: id } : { slug: id.toLowerCase() };

      if (hard === 'true') {
        const deleted = await Resource.findOneAndDelete(query);
        if (!deleted) return res.status(404).json({ success: false, message: 'Resource not found' });
        removeResourceFromIndex(deleted._id).catch(e => console.warn('[AutoRemove Error]:', e.message));
        return res.status(200).json({ success: true, message: 'Resource permanently deleted' });
      }

      // Soft archive
      const archived = await Resource.findOneAndUpdate(query, { status: 'archived' }, { new: true });
      if (!archived) return res.status(404).json({ success: false, message: 'Resource not found' });
      removeResourceFromIndex(archived._id).catch(e => console.warn('[AutoRemove Error]:', e.message));
      return res.status(200).json({
        success: true,
        message: 'Resource moved to archived status',
        resource: archived
      });
    }

    // In-memory fallback
    const idx = memoryResources.findIndex(r => 
      (r._id && String(r._id) === id) || 
      r.id === id || 
      r.slug === id.toLowerCase()
    );

    if (idx === -1) return res.status(404).json({ success: false, message: 'Resource not found' });

    if (hard === 'true') {
      const removed = memoryResources.splice(idx, 1)[0];
      removeResourceFromIndex(removed._id || removed.id).catch(e => console.warn('[AutoRemove Error]:', e.message));
      return res.status(200).json({ success: true, message: 'Resource permanently deleted' });
    }

    memoryResources[idx].status = 'archived';
    removeResourceFromIndex(memoryResources[idx]._id || memoryResources[idx].id).catch(e => console.warn('[AutoRemove Error]:', e.message));
    return res.status(200).json({
      success: true,
      message: 'Resource moved to archived status',
      resource: memoryResources[idx]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete resource',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/resources/ingest
 * @desc    Ingestion pipeline interface for future automated resource discovery
 * @access  Private
 */
router.post('/ingest', protect, async (req, res) => {
  try {
    const candidate = req.body || {};
    const normalized = await ingestResourcePipeline(candidate);

    let rawIngested = null;
    if (mongoose.connection.readyState === 1) {
      const doc = new Resource(normalized);
      await doc.save();
      rawIngested = doc.toJSON ? doc.toJSON() : doc.toObject();
    } else {
      rawIngested = {
        ...normalized,
        id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      };
      memoryResources.push(rawIngested);
    }

    const finalIngested = {
      ...rawIngested,
      id: rawIngested._id ? rawIngested._id.toString() : rawIngested.id || rawIngested.slug,
      platform: rawIngested.platform || rawIngested.videoMetadata?.platform || (rawIngested.type === 'video' ? 'youtube' : undefined),
      videoId: rawIngested.videoId || rawIngested.videoMetadata?.videoId || '',
      provider: rawIngested.provider || rawIngested.videoMetadata?.channel || rawIngested.source || 'CareerOS Academy',
      channel: rawIngested.channel || rawIngested.videoMetadata?.channel || rawIngested.source || 'CareerOS Academy'
    };

    return res.status(201).json({
      success: true,
      message: 'Candidate resource successfully ingested through pipeline into review queue',
      resource: finalIngested
    });
  } catch (error) {
    console.error('[Ingest Error]:', error.message);
    return res.status(400).json({
      success: false,
      message: 'Ingestion pipeline rejected candidate',
      error: error.message
    });
  }
});

export default router;
