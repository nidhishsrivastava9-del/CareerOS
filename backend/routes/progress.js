import express from 'express';
import mongoose from 'mongoose';
import Progress from '../models/Progress.js';
import Career from '../models/Career.js';
import { memoryProgress, memoryCareers } from '../data/store.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Require authentication for all progress endpoints
router.use(protect);

/**
 * Helper to calculate career overall percentage
 */
function calculateCareerProgress(career, completedLessonIds = [], completedModuleSlugs = []) {
  if (!career || !career.roadmapPhases) return 0;
  let totalResources = 0;
  let totalModules = 0;

  career.roadmapPhases.forEach(p => {
    (p.subjects || []).forEach(s => {
      (s.modules || []).forEach(m => {
        totalModules++;
        totalResources += (m.resources || []).length;
      });
    });
  });

  if (totalResources === 0) {
    if (totalModules === 0) return 0;
    return Math.min(100, Math.round((completedModuleSlugs.length / totalModules) * 100));
  }

  // Calculate based on completed lessons
  const percent = Math.min(100, Math.round((completedLessonIds.length / totalResources) * 100));
  return percent;
}

/**
 * Helper to get career definition
 */
async function getCareerDefinition(careerSlug) {
  if (mongoose.connection.readyState === 1) {
    return await Career.findOne({ slug: careerSlug.toLowerCase() }).lean();
  }
  return memoryCareers.find(c => c.slug.toLowerCase() === careerSlug.toLowerCase());
}

/**
 * @route   GET /api/progress
 * @desc    Get all learning progress records for authenticated user
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      const records = await Progress.find({ user: userId }).lean();
      return res.status(200).json({
        success: true,
        count: records.length,
        progress: records
      });
    }

    const records = memoryProgress.filter(p => String(p.user) === String(userId));
    return res.status(200).json({
      success: true,
      count: records.length,
      progress: records
    });
  } catch (error) {
    console.error('[Progress API Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve progress',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/progress/:careerSlug
 * @desc    Get progress for specific career for authenticated user
 * @access  Private
 */
router.get('/:careerSlug', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { careerSlug } = req.params;
    const normalizedSlug = careerSlug.toLowerCase();

    let record = null;

    if (mongoose.connection.readyState === 1) {
      record = await Progress.findOne({ user: userId, careerSlug: normalizedSlug }).lean();
    } else {
      record = memoryProgress.find(
        p => String(p.user) === String(userId) && p.careerSlug === normalizedSlug
      );
    }

    if (!record) {
      // Return initial blank progress object
      return res.status(200).json({
        success: true,
        progress: {
          careerSlug: normalizedSlug,
          completedLessons: [],
          completedModules: [],
          quizScores: [],
          practiceCompleted: [],
          overallPercentage: 0,
          lastActiveModule: '',
          isCurrentActiveCareer: false
        }
      });
    }

    return res.status(200).json({
      success: true,
      progress: record
    });
  } catch (error) {
    console.error('[Progress Career API Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve career progress',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/progress/toggle-lesson
 * @desc    Toggle a lesson/resource completion state and recalculate overall progress
 * @access  Private
 */
router.post('/toggle-lesson', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { careerSlug, moduleSlug, lessonId, completed } = req.body || {};

    if (!careerSlug || !lessonId) {
      return res.status(400).json({
        success: false,
        message: 'careerSlug and lessonId are required'
      });
    }

    const normalizedSlug = careerSlug.toLowerCase();
    const career = await getCareerDefinition(normalizedSlug);

    if (mongoose.connection.readyState === 1) {
      let progress = await Progress.findOne({ user: userId, careerSlug: normalizedSlug });
      if (!progress) {
        progress = new Progress({
          user: userId,
          careerSlug: normalizedSlug,
          completedLessons: [],
          completedModules: [],
          quizScores: [],
          practiceCompleted: [],
          overallPercentage: 0
        });
      }

      const lessonStr = String(lessonId);
      const isAlreadyCompleted = progress.completedLessons.includes(lessonStr);

      const targetCompleted = completed !== undefined ? Boolean(completed) : !isAlreadyCompleted;

      if (targetCompleted && !isAlreadyCompleted) {
        progress.completedLessons.push(lessonStr);
      } else if (!targetCompleted && isAlreadyCompleted) {
        progress.completedLessons = progress.completedLessons.filter(id => id !== lessonStr);
      }

      if (moduleSlug) {
        progress.lastActiveModule = moduleSlug;
      }
      progress.lastAccessedAt = new Date();

      // Recalculate overall percentage
      progress.overallPercentage = calculateCareerProgress(
        career,
        progress.completedLessons,
        progress.completedModules
      );

      await progress.save();

      return res.status(200).json({
        success: true,
        message: `Lesson marked as ${targetCompleted ? 'completed' : 'incomplete'}`,
        progress: progress.toJSON ? progress.toJSON() : progress
      });
    }

    // In-memory fallback
    let recordIndex = memoryProgress.findIndex(
      p => String(p.user) === String(userId) && p.careerSlug === normalizedSlug
    );

    let progressObj = null;
    if (recordIndex === -1) {
      progressObj = {
        id: `prog-${Date.now()}`,
        user: userId,
        careerSlug: normalizedSlug,
        completedLessons: [],
        completedModules: [],
        quizScores: [],
        practiceCompleted: [],
        overallPercentage: 0,
        lastActiveModule: moduleSlug || '',
        lastAccessedAt: new Date()
      };
      memoryProgress.push(progressObj);
      recordIndex = memoryProgress.length - 1;
    } else {
      progressObj = memoryProgress[recordIndex];
    }

    const lessonStr = String(lessonId);
    const isAlreadyCompleted = progressObj.completedLessons.includes(lessonStr);
    const targetCompleted = completed !== undefined ? Boolean(completed) : !isAlreadyCompleted;

    if (targetCompleted && !isAlreadyCompleted) {
      progressObj.completedLessons.push(lessonStr);
    } else if (!targetCompleted && isAlreadyCompleted) {
      progressObj.completedLessons = progressObj.completedLessons.filter(id => id !== lessonStr);
    }

    if (moduleSlug) {
      progressObj.lastActiveModule = moduleSlug;
    }
    progressObj.lastAccessedAt = new Date();
    progressObj.overallPercentage = calculateCareerProgress(
      career,
      progressObj.completedLessons,
      progressObj.completedModules
    );

    memoryProgress[recordIndex] = progressObj;

    return res.status(200).json({
      success: true,
      message: `Lesson marked as ${targetCompleted ? 'completed' : 'incomplete'}`,
      progress: progressObj
    });
  } catch (error) {
    console.error('[Toggle Lesson Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update lesson progress',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/progress/quiz
 * @desc    Submit a quiz score and record progress
 * @access  Private
 */
router.post('/quiz', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { careerSlug, moduleSlug, quizId, score, total, totalQuestions } = req.body || {};

    if (!careerSlug || !quizId) {
      return res.status(400).json({
        success: false,
        message: 'careerSlug and quizId are required'
      });
    }

    const normalizedSlug = careerSlug.toLowerCase();
    const career = await getCareerDefinition(normalizedSlug);
    const resolvedTotal = Number(total || totalQuestions || 3);
    const resolvedScore = Number(score !== undefined ? score : 0);
    const resolvedModule = String(moduleSlug || 'general');
    const percentage = resolvedTotal > 0 ? Math.round((resolvedScore / resolvedTotal) * 100) : 0;

    if (mongoose.connection.readyState === 1) {
      let progress = await Progress.findOne({ user: userId, careerSlug: normalizedSlug });
      if (!progress) {
        progress = new Progress({
          user: userId,
          careerSlug: normalizedSlug,
          completedLessons: [],
          completedModules: [],
          quizScores: [],
          practiceCompleted: [],
          overallPercentage: 0
        });
      }

      // Add quiz to completedLessons
      if (!progress.completedLessons.includes(String(quizId))) {
        progress.completedLessons.push(String(quizId));
      }

      // Record quiz attempt
      progress.quizScores = progress.quizScores.filter(q => q.quizId !== String(quizId));
      progress.quizScores.push({
        quizId: String(quizId),
        moduleSlug: resolvedModule,
        score: resolvedScore,
        total: resolvedTotal,
        percentage,
        completedAt: new Date()
      });

      if (moduleSlug) {
        progress.lastActiveModule = moduleSlug;
      }
      progress.lastAccessedAt = new Date();
      progress.overallPercentage = calculateCareerProgress(
        career,
        progress.completedLessons,
        progress.completedModules
      );

      await progress.save();

      return res.status(200).json({
        success: true,
        message: 'Quiz assessment score saved',
        progress: progress.toJSON ? progress.toJSON() : progress
      });
    }

    // In-memory fallback
    let record = memoryProgress.find(
      p => String(p.user) === String(userId) && p.careerSlug === normalizedSlug
    );
    if (!record) {
      record = {
        id: `prog-${Date.now()}`,
        user: userId,
        careerSlug: normalizedSlug,
        completedLessons: [],
        completedModules: [],
        quizScores: [],
        practiceCompleted: [],
        overallPercentage: 0,
        lastActiveModule: moduleSlug || '',
        lastAccessedAt: new Date()
      };
      memoryProgress.push(record);
    }

    if (!record.completedLessons.includes(String(quizId))) {
      record.completedLessons.push(String(quizId));
    }
    record.quizScores = (record.quizScores || []).filter(q => q.quizId !== String(quizId));
    record.quizScores.push({
      quizId: String(quizId),
      moduleSlug: moduleSlug || '',
      score,
      total,
      percentage,
      completedAt: new Date()
    });

    if (moduleSlug) record.lastActiveModule = moduleSlug;
    record.lastAccessedAt = new Date();
    record.overallPercentage = calculateCareerProgress(
      career,
      record.completedLessons,
      record.completedModules
    );

    return res.status(200).json({
      success: true,
      message: 'Quiz assessment score saved',
      progress: record
    });
  } catch (error) {
    console.error('[Quiz Progress Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to record quiz progress',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/progress/practice
 * @desc    Record completion of a practice task
 * @access  Private
 */
router.post('/practice', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { careerSlug, moduleSlug, taskId } = req.body || {};

    if (!careerSlug || !taskId) {
      return res.status(400).json({
        success: false,
        message: 'careerSlug and taskId are required'
      });
    }

    const normalizedSlug = careerSlug.toLowerCase();
    const career = await getCareerDefinition(normalizedSlug);

    if (mongoose.connection.readyState === 1) {
      let progress = await Progress.findOne({ user: userId, careerSlug: normalizedSlug });
      if (!progress) {
        progress = new Progress({
          user: userId,
          careerSlug: normalizedSlug,
          completedLessons: [],
          completedModules: [],
          quizScores: [],
          practiceCompleted: [],
          overallPercentage: 0
        });
      }

      if (!progress.completedLessons.includes(String(taskId))) {
        progress.completedLessons.push(String(taskId));
      }

      progress.practiceCompleted = progress.practiceCompleted.filter(t => t.taskId !== String(taskId));
      progress.practiceCompleted.push({
        taskId: String(taskId),
        moduleSlug: moduleSlug || '',
        completedAt: new Date()
      });

      if (moduleSlug) {
        progress.lastActiveModule = moduleSlug;
      }
      progress.lastAccessedAt = new Date();
      progress.overallPercentage = calculateCareerProgress(
        career,
        progress.completedLessons,
        progress.completedModules
      );

      await progress.save();

      return res.status(200).json({
        success: true,
        message: 'Practice task completed',
        progress: progress.toJSON ? progress.toJSON() : progress
      });
    }

    // In-memory fallback
    let record = memoryProgress.find(
      p => String(p.user) === String(userId) && p.careerSlug === normalizedSlug
    );
    if (!record) {
      record = {
        id: `prog-${Date.now()}`,
        user: userId,
        careerSlug: normalizedSlug,
        completedLessons: [],
        completedModules: [],
        quizScores: [],
        practiceCompleted: [],
        overallPercentage: 0,
        lastActiveModule: moduleSlug || '',
        lastAccessedAt: new Date()
      };
      memoryProgress.push(record);
    }

    if (!record.completedLessons.includes(String(taskId))) {
      record.completedLessons.push(String(taskId));
    }
    record.practiceCompleted = (record.practiceCompleted || []).filter(t => t.taskId !== String(taskId));
    record.practiceCompleted.push({
      taskId: String(taskId),
      moduleSlug: moduleSlug || '',
      completedAt: new Date()
    });

    if (moduleSlug) record.lastActiveModule = moduleSlug;
    record.lastAccessedAt = new Date();
    record.overallPercentage = calculateCareerProgress(
      career,
      record.completedLessons,
      record.completedModules
    );

    return res.status(200).json({
      success: true,
      message: 'Practice task completed',
      progress: record
    });
  } catch (error) {
    console.error('[Practice Progress Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to record practice task',
      error: error.message
    });
  }
});

export default router;
