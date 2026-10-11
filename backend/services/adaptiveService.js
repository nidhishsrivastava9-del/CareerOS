import mongoose from 'mongoose';
import SkillMastery from '../models/SkillMastery.js';
import Skill from '../models/Skill.js';
import Progress from '../models/Progress.js';
import { 
  memorySkillMasteries, 
  skills as memorySkills, 
  memoryProgress 
} from '../data/store.js';

/**
 * CareerOS — Adaptive Difficulty & Mastery Recalibration Service (Day 11)
 * 
 * Implements:
 * 1. Adaptive question selection based on learner mastery and historical performance.
 * 2. Evidence-based skill mastery recalibration using exponential moving averages.
 * 3. Synchronization with existing student progress and skill records.
 */

/**
 * Select questions adaptively for an assessment
 */
export function selectAdaptiveQuestions({
  assessment,
  candidateQuestions = [],
  previousAttempts = [],
  targetCount = 5
}) {
  if (!candidateQuestions.length) return [];

  // If assessment has specific fixed questionIds, retrieve those
  if (assessment.questionIds?.length && !assessment.adaptive) {
    const fixedSet = new Set(assessment.questionIds.map(String));
    const matched = candidateQuestions.filter(q => fixedSet.has(String(q.questionId)));
    if (matched.length > 0) {
      return matched.slice(0, targetCount);
    }
  }

  // Determine learner's historical performance in this module/topic
  let averagePastScore = 60; // neutral default
  if (previousAttempts.length > 0) {
    const totalScore = previousAttempts.reduce((acc, a) => acc + (a.percentage || 0), 0);
    averagePastScore = Math.round(totalScore / previousAttempts.length);
  }

  // Gather recently answered question IDs to avoid immediate repetition
  const recentQuestionIds = new Set();
  previousAttempts.slice(0, 2).forEach(att => {
    (att.answers || []).forEach(ans => recentQuestionIds.add(String(ans.questionId)));
  });

  // Group candidates by difficulty
  const beginner = [];
  const intermediate = [];
  const advanced = [];

  for (const q of candidateQuestions) {
    if (q.difficulty === 'advanced') advanced.push(q);
    else if (q.difficulty === 'intermediate') intermediate.push(q);
    else beginner.push(q);
  }

  // Adaptive difficulty target distribution
  let targetBeginner = 2;
  let targetIntermediate = 2;
  let targetAdvanced = 1;

  if (averagePastScore >= 80) {
    // High mastery: present challenging advanced questions
    targetBeginner = 0;
    targetIntermediate = 2;
    targetAdvanced = 3;
  } else if (averagePastScore >= 60) {
    // Solid intermediate: balanced distribution
    targetBeginner = 1;
    targetIntermediate = 3;
    targetAdvanced = 1;
  } else {
    // Foundational remediation: focus on beginner reinforcement
    targetBeginner = 3;
    targetIntermediate = 2;
    targetAdvanced = 0;
  }

  const pickFromGroup = (group, count) => {
    // Prioritize questions not answered in the immediate last attempt
    const unseen = group.filter(q => !recentQuestionIds.has(String(q.questionId)));
    const seen = group.filter(q => recentQuestionIds.has(String(q.questionId)));
    const pool = [...unseen, ...seen];
    return pool.slice(0, count);
  };

  const selected = [
    ...pickFromGroup(beginner, targetBeginner),
    ...pickFromGroup(intermediate, targetIntermediate),
    ...pickFromGroup(advanced, targetAdvanced)
  ];

  // Fill remaining slots if candidate pool in a specific bucket was small
  if (selected.length < targetCount) {
    const currentIds = new Set(selected.map(q => String(q.questionId)));
    for (const q of candidateQuestions) {
      if (!currentIds.has(String(q.questionId))) {
        selected.push(q);
        currentIds.add(String(q.questionId));
        if (selected.length >= targetCount) break;
      }
    }
  }

  return selected.slice(0, targetCount);
}

/**
 * Recalibrate skill mastery following an assessment evaluation
 */
export async function recalibrateSkillMastery({
  userId,
  career,
  assessment,
  gradingResult
}) {
  if (!userId) return [];

  const isDbConnected = mongoose.connection.readyState === 1;
  const updatedMasteries = [];

  for (const sPerf of (gradingResult.skillPerformance || [])) {
    const skillName = sPerf.name;
    const newScore = sPerf.percentage;

    let masteryDoc = null;

    if (isDbConnected) {
      try {
        masteryDoc = await SkillMastery.findOne({
          user: userId,
          skillName,
          career: String(career).toLowerCase().trim()
        });

        if (!masteryDoc) {
          masteryDoc = new SkillMastery({
            user: userId,
            skillName,
            career: String(career).toLowerCase().trim(),
            category: assessment.subject || 'Engineering',
            masteryPercentage: newScore,
            assessmentCount: 1,
            lastScore: newScore,
            confidence: 'low',
            trend: 'stable',
            evidence: [
              {
                type: assessment.type === 'quiz' ? 'quiz' : 'assessment',
                referenceId: assessment.assessmentId,
                title: assessment.title,
                score: gradingResult.score,
                maxScore: gradingResult.totalPoints,
                percentage: newScore,
                recordedAt: new Date()
              }
            ],
            lastAssessedAt: new Date()
          });
        } else {
          // Weighted moving average recalibration: 65% previous mastery + 35% new assessment
          const previousMastery = masteryDoc.masteryPercentage || 50;
          const recalculated = Math.round(previousMastery * 0.65 + newScore * 0.35);

          masteryDoc.masteryPercentage = Math.max(0, Math.min(100, recalculated));
          masteryDoc.assessmentCount += 1;
          masteryDoc.lastScore = newScore;
          masteryDoc.confidence = masteryDoc.assessmentCount >= 3 ? 'high' : 'medium';
          masteryDoc.trend = newScore > previousMastery + 5 ? 'improving' : newScore < previousMastery - 5 ? 'declining' : 'stable';
          masteryDoc.lastAssessedAt = new Date();

          masteryDoc.evidence.push({
            type: assessment.type === 'quiz' ? 'quiz' : 'assessment',
            referenceId: assessment.assessmentId,
            title: assessment.title,
            score: gradingResult.score,
            maxScore: gradingResult.totalPoints,
            percentage: newScore,
            recordedAt: new Date()
          });
        }

        await masteryDoc.save();
        updatedMasteries.push(masteryDoc.toObject());

        // Synchronize with existing Skill tracker in background
        await Skill.findOneAndUpdate(
          { user: userId, name: new RegExp(`^${skillName}$`, 'i') },
          { progress: masteryDoc.masteryPercentage }
        );
      } catch (err) {
        console.warn('[AdaptiveService Recalibration Error]:', err.message);
      }
    } else {
      // Memory store fallback
      let memMastery = memorySkillMasteries.find(m => 
        String(m.user) === String(userId) && 
        m.skillName.toLowerCase() === skillName.toLowerCase()
      );

      if (!memMastery) {
        memMastery = {
          user: userId,
          skillName,
          career: String(career).toLowerCase().trim(),
          category: assessment.subject || 'Engineering',
          masteryPercentage: newScore,
          assessmentCount: 1,
          lastScore: newScore,
          confidence: 'low',
          trend: 'stable',
          evidence: [
            {
              type: assessment.type === 'quiz' ? 'quiz' : 'assessment',
              referenceId: assessment.assessmentId,
              title: assessment.title,
              score: gradingResult.score,
              maxScore: gradingResult.totalPoints,
              percentage: newScore,
              recordedAt: new Date()
            }
          ],
          lastAssessedAt: new Date()
        };
        memorySkillMasteries.push(memMastery);
      } else {
        const previousMastery = memMastery.masteryPercentage || 50;
        memMastery.masteryPercentage = Math.round(previousMastery * 0.65 + newScore * 0.35);
        memMastery.assessmentCount += 1;
        memMastery.lastScore = newScore;
        memMastery.confidence = memMastery.assessmentCount >= 3 ? 'high' : 'medium';
        memMastery.trend = newScore > previousMastery + 5 ? 'improving' : newScore < previousMastery - 5 ? 'declining' : 'stable';
        memMastery.lastAssessedAt = new Date();
      }

      updatedMasteries.push(memMastery);

      // Memory Skill sync
      const memSkill = memorySkills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
      if (memSkill) {
        memSkill.progress = memMastery.masteryPercentage;
      }
    }
  }

  // Update Progress quizScores if assessment is a quiz or module test
  try {
    const quizScoreEntry = {
      quizId: assessment.assessmentId,
      moduleSlug: assessment.module || 'javascript-core',
      score: gradingResult.score,
      total: gradingResult.totalPoints,
      percentage: gradingResult.percentage,
      completedAt: new Date()
    };

    if (isDbConnected) {
      await Progress.findOneAndUpdate(
        { user: userId, careerSlug: String(career).toLowerCase().trim() },
        { $push: { quizScores: quizScoreEntry } },
        { upsert: true }
      );
    } else {
      const prog = memoryProgress.find(p => p.careerSlug === String(career).toLowerCase().trim());
      if (prog) {
        if (!prog.quizScores) prog.quizScores = [];
        prog.quizScores.push(quizScoreEntry);
      }
    }
  } catch (err) {
    console.warn('[AdaptiveService Progress Sync Note]:', err.message);
  }

  return updatedMasteries;
}

export default {
  selectAdaptiveQuestions,
  recalibrateSkillMastery
};
