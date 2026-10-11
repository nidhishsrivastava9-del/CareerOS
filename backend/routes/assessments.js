import express from 'express';
import mongoose from 'mongoose';
import Assessment from '../models/Assessment.js';
import Question from '../models/Question.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import SkillMastery from '../models/SkillMastery.js';
import { 
  memoryAssessments, 
  memoryQuestions, 
  memoryAssessmentAttempts, 
  memorySkillMasteries 
} from '../data/store.js';
import { QUESTIONS_SEED, ASSESSMENTS_SEED } from '../data/questionBankSeedData.js';
import { gradeAssessmentSubmission } from '../services/gradingService.js';
import { selectAdaptiveQuestions, recalibrateSkillMastery } from '../services/adaptiveService.js';
import { generateAssessmentRecommendations, getStudentLearningDiagnostics } from '../services/recommendationService.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Ensure initial Question Bank and Assessments are seeded in MongoDB
 */
export async function ensureAssessmentsSeeded() {
  if (mongoose.connection.readyState === 1) {
    try {
      const qCount = await Question.countDocuments();
      if (qCount === 0) {
        console.log('[CareerOS Assessment Engine]: Seeding Question Bank...');
        await Question.insertMany(QUESTIONS_SEED);
        console.log(`[CareerOS Assessment Engine]: Seeded ${QUESTIONS_SEED.length} questions into Question Bank.`);
      }

      const aCount = await Assessment.countDocuments();
      if (aCount === 0) {
        console.log('[CareerOS Assessment Engine]: Seeding Assessments...');
        await Assessment.insertMany(ASSESSMENTS_SEED);
        console.log(`[CareerOS Assessment Engine]: Seeded ${ASSESSMENTS_SEED.length} curriculum assessments.`);
      }
    } catch (err) {
      console.warn('[CareerOS Assessment Engine]: Seeding warning:', err.message);
    }
  } else {
    // Memory store seeding
    if (memoryQuestions.length === 0) {
      memoryQuestions.push(...QUESTIONS_SEED);
    }
    if (memoryAssessments.length === 0) {
      memoryAssessments.push(...ASSESSMENTS_SEED);
    }
  }
}

/**
 * @route   GET /api/assessments
 * @desc    Get published assessments filtered by career, module, topic, difficulty
 * @access  Public / Learners
 */
router.get('/', async (req, res) => {
  try {
    const { career, module: modSlug, topic, difficulty, type } = req.query || {};
    const isDbConnected = mongoose.connection.readyState === 1;

    await ensureAssessmentsSeeded();

    let assessments = [];

    if (isDbConnected) {
      const query = { status: 'published' };
      if (career) query.career = String(career).toLowerCase().trim();
      if (modSlug) query.module = String(modSlug).toLowerCase().trim();
      if (topic) query.topic = new RegExp(topic.trim(), 'i');
      if (difficulty && difficulty !== 'all') query.difficulty = difficulty.toLowerCase().trim();
      if (type) query.type = type.toLowerCase().trim();

      assessments = await Assessment.find(query).lean();
    } else {
      assessments = memoryAssessments.filter(a => {
        if (a.status !== 'published') return false;
        if (career && a.career !== String(career).toLowerCase().trim()) return false;
        if (modSlug && a.module !== String(modSlug).toLowerCase().trim()) return false;
        if (difficulty && difficulty !== 'all' && a.difficulty !== difficulty.toLowerCase().trim()) return false;
        if (type && a.type !== type.toLowerCase().trim()) return false;
        return true;
      });
    }

    return res.status(200).json({
      success: true,
      count: assessments.length,
      assessments
    });
  } catch (error) {
    console.error('[Get Assessments Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve assessments',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/assessments/attempts
 * @desc    Get authenticated user's previous assessment attempts (user-isolated)
 * @access  Private
 */
router.get('/attempts', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { career, assessmentId, limit = 20 } = req.query || {};
    const isDbConnected = mongoose.connection.readyState === 1;

    let attempts = [];

    if (isDbConnected) {
      const query = { user: userId };
      if (career) query.career = String(career).toLowerCase().trim();
      if (assessmentId) query.assessmentId = String(assessmentId).trim();

      attempts = await AssessmentAttempt.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit, 10))
        .lean();
    } else {
      attempts = memoryAssessmentAttempts
        .filter(a => String(a.user) === String(userId))
        .filter(a => !career || a.career === String(career).toLowerCase().trim())
        .filter(a => !assessmentId || a.assessmentId === String(assessmentId).trim())
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, parseInt(limit, 10));
    }

    return res.status(200).json({
      success: true,
      count: attempts.length,
      attempts
    });
  } catch (error) {
    console.error('[Get Attempts Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve assessment attempts',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/assessments/attempts/:attemptId
 * @desc    Get detailed review of a specific assessment attempt (user-isolated)
 * @access  Private
 */
router.get('/attempts/:attemptId', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { attemptId } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    let attempt = null;

    if (isDbConnected) {
      const isMongoId = mongoose.Types.ObjectId.isValid(attemptId);
      attempt = await AssessmentAttempt.findOne({
        user: userId,
        $or: [
          { attemptId: String(attemptId) },
          ...(isMongoId ? [{ _id: attemptId }] : [])
        ]
      }).lean();
    } else {
      attempt = memoryAssessmentAttempts.find(a => 
        (a.attemptId === attemptId || a.id === attemptId || String(a._id) === String(attemptId)) && 
        String(a.user) === String(userId)
      );
    }

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Assessment attempt not found or access denied'
      });
    }

    return res.status(200).json({
      success: true,
      attempt
    });
  } catch (error) {
    console.error('[Get Attempt By ID Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve assessment attempt',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/assessments/diagnostics
 * @desc    Get aggregated student mastery diagnostics & recommendations
 * @access  Private
 */
router.get('/diagnostics', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { careerSlug = 'full-stack-developer' } = req.query || {};

    const diagnostics = await getStudentLearningDiagnostics(userId, careerSlug);

    return res.status(200).json({
      success: true,
      diagnostics
    });
  } catch (error) {
    console.error('[Get Diagnostics Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve learning diagnostics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/assessments/:id
 * @desc    Retrieve assessment metadata & questions for taking the test
 *          SECURITY: Strips correct answers and explanations before sending to client!
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    await ensureAssessmentsSeeded();

    let assessment = null;

    if (isDbConnected) {
      assessment = await Assessment.findOne({
        $or: [{ assessmentId: id }, { _id: mongoose.Types.ObjectId.isValid(id) ? id : null }]
      }).lean();
    } else {
      assessment = memoryAssessments.find(a => a.assessmentId === id || a.id === id);
    }

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: `Assessment "${id}" not found`
      });
    }

    // Retrieve candidate questions from Question Bank
    let candidateQuestions = [];
    if (isDbConnected) {
      candidateQuestions = await Question.find({
        career: assessment.career,
        module: assessment.module,
        status: 'active'
      }).lean();
    } else {
      candidateQuestions = memoryQuestions.filter(q => 
        q.career === assessment.career && 
        q.module === assessment.module && 
        q.status === 'active'
      );
    }

    // Retrieve student previous attempts for adaptive difficulty
    let previousAttempts = [];
    if (isDbConnected) {
      previousAttempts = await AssessmentAttempt.find({
        user: userId,
        assessmentId: assessment.assessmentId
      }).sort({ createdAt: -1 }).limit(3).lean();
    } else {
      previousAttempts = memoryAssessmentAttempts.filter(a => 
        String(a.user) === String(userId) && a.assessmentId === assessment.assessmentId
      );
    }

    const selectedQuestions = selectAdaptiveQuestions({
      assessment,
      candidateQuestions,
      previousAttempts,
      targetCount: assessment.questionCount || 5
    });

    // CRITICAL SECURITY SANITIZATION:
    // Strip correctAnswers and explanation so client NEVER receives answer key before submission!
    const clientSafeQuestions = selectedQuestions.map(q => ({
      _id: q._id,
      id: q.questionId || String(q._id),
      questionId: q.questionId || String(q._id),
      question: q.text,
      text: q.text,
      codeSnippet: q.codeSnippet || '',
      type: q.type,
      options: q.options,
      difficulty: q.difficulty,
      topic: q.topic,
      skills: q.skills || [],
      points: q.points || 10
    }));

    const assessmentPayload = {
      _id: assessment._id,
      id: assessment.assessmentId,
      assessmentId: assessment.assessmentId,
      title: assessment.title,
      description: assessment.description,
      type: assessment.type,
      career: assessment.career,
      module: assessment.module,
      topic: assessment.topic,
      difficulty: assessment.difficulty,
      timeLimitMinutes: assessment.timeLimitMinutes,
      questionCount: clientSafeQuestions.length,
      passingScore: assessment.passingScore,
      adaptive: assessment.adaptive,
      questions: clientSafeQuestions
    };

    return res.status(200).json({
      success: true,
      assessment: assessmentPayload,
      questions: clientSafeQuestions
    });
  } catch (error) {
    console.error('[Get Assessment Details Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load assessment',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/assessments/:id/submit
 * @desc    Submit assessment answers, execute authoritative server grading,
 *          recalibrate skill mastery, generate recommendations, and record attempt.
 * @access  Private
 */
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { answers = [], timeTakenSeconds = 0 } = req.body || {};
    const isDbConnected = mongoose.connection.readyState === 1;

    await ensureAssessmentsSeeded();

    let assessment = null;
    if (isDbConnected) {
      assessment = await Assessment.findOne({
        $or: [{ assessmentId: id }, { _id: mongoose.Types.ObjectId.isValid(id) ? id : null }]
      }).lean();
    } else {
      assessment = memoryAssessments.find(a => a.assessmentId === id || a.id === id);
    }

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: `Assessment "${id}" not found`
      });
    }

    // Normalize submitted answers format (handles object map or array)
    let normalizedAnswers = [];
    if (Array.isArray(answers)) {
      normalizedAnswers = answers.map(a => ({
        questionId: String(a.questionId || a._id || a.id),
        selectedAnswers: Array.isArray(a.selectedAnswers)
          ? a.selectedAnswers
          : a.selectedAnswers !== undefined
          ? [a.selectedAnswers]
          : a.selectedOption !== undefined
          ? [a.selectedOption]
          : []
      }));
    } else if (answers && typeof answers === 'object') {
      normalizedAnswers = Object.entries(answers).map(([qId, val]) => ({
        questionId: String(qId),
        selectedAnswers: Array.isArray(val) ? val : (val !== null && val !== undefined ? [val] : [])
      }));
    }

    // Retrieve authoritative questions for grading
    const submittedQIds = normalizedAnswers.map(a => String(a.questionId));
    let authoritativeQuestions = [];

    if (isDbConnected) {
      authoritativeQuestions = await Question.find({
        $or: [
          { questionId: { $in: submittedQIds } },
          { _id: { $in: submittedQIds.filter(qId => mongoose.Types.ObjectId.isValid(qId)) } },
          { career: assessment.career, module: assessment.module }
        ]
      }).lean();
    } else {
      authoritativeQuestions = memoryQuestions.filter(q => 
        submittedQIds.includes(String(q.questionId)) ||
        submittedQIds.includes(String(q._id)) ||
        (q.career === assessment.career && q.module === assessment.module)
      );
    }

    // Map questionId consistently so grading matches regardless of _id vs questionId
    const mappedQuestions = authoritativeQuestions.map(q => {
      const qId = String(q.questionId || q._id);
      return {
        ...q,
        questionId: qId
      };
    });

    // Also map normalized answers if learner sent Mongo _id instead of questionId
    const idToQuestionMap = new Map();
    authoritativeQuestions.forEach(q => {
      if (q._id) idToQuestionMap.set(String(q._id), String(q.questionId || q._id));
      if (q.questionId) idToQuestionMap.set(String(q.questionId), String(q.questionId));
    });

    const finalSubmittedAnswers = normalizedAnswers.map(ans => ({
      questionId: idToQuestionMap.get(ans.questionId) || ans.questionId,
      selectedAnswers: ans.selectedAnswers
    }));

    // 1. Authoritative Server-Side Grading
    const gradingResult = gradeAssessmentSubmission({
      assessment,
      questions: mappedQuestions,
      submittedAnswers: finalSubmittedAnswers
    });

    // 2. Adaptive Skill Mastery Recalibration
    const updatedMasteries = await recalibrateSkillMastery({
      userId,
      career: assessment.career,
      assessment,
      gradingResult
    });

    // 3. Personalized Recommendation Generation
    const recommendations = await generateAssessmentRecommendations({
      career: assessment.career,
      module: assessment.module,
      gradingResult,
      assessment
    });

    // 4. Persist User-Scoped Assessment Attempt
    const attemptData = {
      user: userId,
      attemptId: `att-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      assessmentId: assessment.assessmentId,
      assessmentTitle: assessment.title,
      career: assessment.career,
      module: assessment.module,
      topic: assessment.topic,
      startedAt: new Date(Date.now() - (timeTakenSeconds * 1000)),
      submittedAt: new Date(),
      timeTakenSeconds,
      answers: gradingResult.answers,
      score: gradingResult.score,
      totalPoints: gradingResult.totalPoints,
      percentage: gradingResult.percentage,
      passed: gradingResult.passed,
      correctCount: gradingResult.correctCount,
      incorrectCount: gradingResult.incorrectCount,
      skippedCount: gradingResult.skippedCount,
      topicPerformance: gradingResult.topicPerformance,
      skillPerformance: gradingResult.skillPerformance,
      recommendations
    };

    let savedAttempt = null;

    if (isDbConnected) {
      const attemptDoc = new AssessmentAttempt(attemptData);
      await attemptDoc.save();
      savedAttempt = attemptDoc.toObject();
    } else {
      savedAttempt = { ...attemptData, id: attemptData.attemptId, createdAt: new Date() };
      memoryAssessmentAttempts.push(savedAttempt);
    }

    const clientAttempt = {
      ...savedAttempt,
      review: gradingResult.reviewItems.map(item => ({
        ...item,
        question: item.text,
        learnerAnswer: item.selectedAnswers
      })),
      reviewItems: gradingResult.reviewItems,
      recommendations,
      masteryRecalibration: updatedMasteries
    };

    return res.status(200).json({
      success: true,
      message: gradingResult.passed
        ? `Congratulations! You passed with ${gradingResult.percentage}%.`
        : `Assessment completed. You scored ${gradingResult.percentage}%. Review recommendations below.`,
      attempt: clientAttempt,
      reviewItems: gradingResult.reviewItems,
      review: clientAttempt.review,
      masteryUpdates: updatedMasteries,
      recommendations
    });
  } catch (error) {
    console.error('[Submit Assessment Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to grade assessment submission',
      error: error.message
    });
  }
});

export default router;
