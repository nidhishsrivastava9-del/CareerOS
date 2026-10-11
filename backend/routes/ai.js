import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  processUserMessage,
  getUserConversations,
  getConversationById,
  deleteConversation,
  handleQuickAction
} from '../services/aiService.js';
import { buildUserContext } from '../services/contextBuilder.js';

const router = express.Router();

// Private routes — all require valid JWT authentication
router.use(protect);

/**
 * @route   POST /api/ai/chat
 * @desc    Send a message to CareerOS Helping AI
 * @access  Private
 */
router.post('/chat', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { message, conversationId, careerSlug, moduleSlug, topic } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A message string is required.'
      });
    }

    const result = await processUserMessage({
      userId,
      conversationId,
      message,
      careerSlug,
      moduleSlug,
      topic
    });

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('[AI Chat Route Error]:', error.message);
    const statusCode = error.statusCode || (error.message.includes('required') ? 400 : 500);
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to process AI chat request'
    });
  }
});

/**
 * @route   GET /api/ai/conversations
 * @desc    Get user's conversation list (user-isolated)
 * @access  Private
 */
router.get('/conversations', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const limit = parseInt(req.query.limit, 10) || 20;
    const page = parseInt(req.query.page, 10) || 1;

    const result = await getUserConversations(userId, { limit, page });

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('[AI Conversations Route Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversations',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ai/conversations/:id
 * @desc    Get specific conversation by ID (user-isolated)
 * @access  Private
 */
router.get('/conversations/:id', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const conversation = await getConversationById(userId, id);

    return res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to retrieve conversation'
    });
  }
});

/**
 * @route   DELETE /api/ai/conversations/:id
 * @desc    Delete specific conversation by ID (user-isolated)
 * @access  Private
 */
router.delete('/conversations/:id', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const result = await deleteConversation(userId, id);

    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete conversation'
    });
  }
});

/**
 * @route   POST /api/ai/quick-action
 * @desc    Trigger a contextual preset prompt (explain, practice, study-plan, weak-areas, debug)
 * @access  Private
 */
router.post('/quick-action', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { action, conversationId, careerSlug, moduleSlug, topic } = req.body || {};

    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'Action parameter is required (e.g. explain, practice, study-plan, weak-areas, debug)'
      });
    }

    const result = await handleQuickAction({
      userId,
      conversationId,
      action,
      careerSlug,
      moduleSlug,
      topic
    });

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('[AI Quick Action Error]:', error.message);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to process AI quick action'
    });
  }
});

/**
 * @route   GET /api/ai/context
 * @desc    Fetch active learning context for badges/preview
 * @access  Private
 */
router.get('/context', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { careerSlug, moduleSlug, topic } = req.query;

    const context = await buildUserContext(userId, {
      careerSlug,
      moduleSlug,
      topic
    });

    return res.status(200).json({
      success: true,
      context
    });
  } catch (error) {
    console.error('[AI Context Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to build user context',
      error: error.message
    });
  }
});

// ============================================================================
// Day 10 Knowledge Base & RAG Administration Endpoints
// ============================================================================

/**
 * @route   GET /api/ai/knowledge/status
 * @desc    Get knowledge base statistics (chunk count, indexed resources, type breakdown)
 * @access  Private
 */
router.get('/knowledge/status', async (req, res) => {
  try {
    const { getKnowledgeStatus } = await import('../services/indexingService.js');
    const status = await getKnowledgeStatus();
    return res.status(200).json({
      success: true,
      status
    });
  } catch (error) {
    console.error('[Knowledge Status Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve knowledge base status',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/knowledge/search
 * @desc    Test knowledge retrieval query with contextual filtering
 * @access  Private
 */
router.post('/knowledge/search', async (req, res) => {
  try {
    const { query, careerSlug, moduleSlug, topic, sourceType, limit, minScore } = req.body || {};

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A search query string is required'
      });
    }

    const { default: KnowledgeRetriever } = await import('../services/retrievalService.js');
    const searchResult = await KnowledgeRetriever.search({
      query: query.trim(),
      filters: {
        career: careerSlug,
        module: moduleSlug,
        topic,
        sourceType
      },
      limit: limit ? parseInt(limit, 10) : 4,
      minScore: minScore !== undefined ? parseFloat(minScore) : 0.25
    });

    return res.status(200).json({
      success: true,
      ...searchResult
    });
  } catch (error) {
    console.error('[Knowledge Search Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to execute knowledge search',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/knowledge/reindex-all
 * @desc    Reindex all published learning resources in the system
 * @access  Private
 */
router.post('/knowledge/reindex-all', async (req, res) => {
  try {
    const { career, module: modSlug, force } = req.body || {};
    const { reindexAll } = await import('../services/indexingService.js');
    const result = await reindexAll({ career, module: modSlug, force: Boolean(force) });

    return res.status(200).json({
      success: true,
      message: 'Knowledge reindexing completed successfully',
      ...result
    });
  } catch (error) {
    console.error('[Knowledge Reindex Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to reindex knowledge base',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/knowledge/index-resource
 * @desc    Index or reindex a specific resource by ID
 * @access  Private
 */
router.post('/knowledge/index-resource', async (req, res) => {
  try {
    const { resourceId, force } = req.body || {};
    if (!resourceId) {
      return res.status(400).json({
        success: false,
        message: 'resourceId parameter is required'
      });
    }

    const Resource = (await import('../models/Resource.js')).default;
    const { indexResource } = await import('../services/indexingService.js');

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: `Resource ${resourceId} not found`
      });
    }

    const result = await indexResource(resource, { force: Boolean(force) });
    return res.status(200).json({
      success: true,
      result
    });
  } catch (error) {
    console.error('[Knowledge Index Resource Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to index resource',
      error: error.message
    });
  }
});

export default router;
