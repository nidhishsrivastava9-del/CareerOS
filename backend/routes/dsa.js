import express from 'express';
import mongoose from 'mongoose';
import Dsa, { DEFAULT_DSA_TOPICS } from '../models/Dsa.js';
import { dsaTopics } from '../data/store.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all DSA routes
router.use(protect);

/**
 * @route   GET /api/dsa
 * @desc    Get all DSA topics and progress for the authenticated user
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      let topics = await Dsa.find({ user: userId }).sort({ createdAt: 1 });

      if (!topics || topics.length === 0) {
        const initialTopics = DEFAULT_DSA_TOPICS.map((t) => ({
          ...t,
          user: userId
        }));
        topics = await Dsa.insertMany(initialTopics);
      }

      const totalSolved = topics.reduce((acc, t) => acc + (Number(t.solved) || 0), 0);
      const totalQuestions = topics.reduce((acc, t) => acc + (Number(t.total) || 0), 0);
      const overallProgress = totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0;

      return res.status(200).json({
        success: true,
        count: topics.length,
        summary: {
          totalSolved,
          totalQuestions,
          overallProgress
        },
        data: topics
      });
    }

    // In-memory fallback
    const totalSolved = dsaTopics.reduce((acc, t) => acc + (Number(t.solved) || 0), 0);
    const totalQuestions = dsaTopics.reduce((acc, t) => acc + (Number(t.total) || 0), 0);
    const overallProgress = totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0;

    return res.status(200).json({
      success: true,
      count: dsaTopics.length,
      summary: {
        totalSolved,
        totalQuestions,
        overallProgress
      },
      data: dsaTopics
    });
  } catch (error) {
    console.error('[Get DSA Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve DSA topics',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/dsa/:id
 * @desc    Update progress/solved/total for a DSA topic by ID or topic name owned by user
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { solved, total, topic, progress, easy, medium, hard } = req.body;
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      let currentTopic = null;

      if (mongoose.Types.ObjectId.isValid(id)) {
        currentTopic = await Dsa.findOne({ _id: id, user: userId });
      }

      if (!currentTopic) {
        currentTopic = await Dsa.findOne({
          user: userId,
          topic: new RegExp(`^${id}$`, 'i')
        });
      }

      if (!currentTopic) {
        return res.status(404).json({
          success: false,
          message: `DSA topic not found with identifier: ${id} for your account`
        });
      }

      if (topic !== undefined) currentTopic.topic = topic.trim();
      if (total !== undefined) currentTopic.total = Number(total);
      if (solved !== undefined) currentTopic.solved = Number(solved);
      if (easy !== undefined) currentTopic.easy = Number(easy);
      if (medium !== undefined) currentTopic.medium = Number(medium);
      if (hard !== undefined) currentTopic.hard = Number(hard);

      if (progress !== undefined) {
        currentTopic.progress = Number(progress);
      } else {
        currentTopic.progress = currentTopic.total > 0 
          ? Math.round((currentTopic.solved / currentTopic.total) * 100) 
          : 0;
      }

      await currentTopic.save();

      return res.status(200).json({
        success: true,
        message: `DSA topic "${currentTopic.topic}" updated successfully`,
        data: currentTopic
      });
    }

    // In-memory fallback
    const topicIndex = dsaTopics.findIndex(
      (t) => t.id === id || t.topic.toLowerCase() === id.toLowerCase()
    );

    if (topicIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `DSA topic not found with identifier: ${id}`
      });
    }

    const currentTopic = dsaTopics[topicIndex];
    if (topic !== undefined) currentTopic.topic = topic.trim();
    if (total !== undefined) currentTopic.total = Number(total);
    if (solved !== undefined) currentTopic.solved = Number(solved);
    if (easy !== undefined) currentTopic.easy = Number(easy);
    if (medium !== undefined) currentTopic.medium = Number(medium);
    if (hard !== undefined) currentTopic.hard = Number(hard);
    if (progress !== undefined) {
      currentTopic.progress = Number(progress);
    } else {
      currentTopic.progress = currentTopic.total > 0 
        ? Math.round((currentTopic.solved / currentTopic.total) * 100) 
        : 0;
    }

    return res.status(200).json({
      success: true,
      message: `DSA topic "${currentTopic.topic}" updated successfully`,
      data: currentTopic
    });
  } catch (error) {
    console.error('[Update DSA Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update DSA topic',
      error: error.message
    });
  }
});

export default router;
