import mongoose from 'mongoose';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import SkillMastery from '../models/SkillMastery.js';
import Resource from '../models/Resource.js';
import Progress from '../models/Progress.js';
import Career from '../models/Career.js';
import { 
  memoryAssessmentAttempts, 
  memorySkillMasteries, 
  memoryResources,
  memoryProgress,
  memoryCareers
} from '../data/store.js';

/**
 * CareerOS — Adaptive Recommendation & Learning Diagnostics Engine (Day 11)
 * 
 * Analyzes assessment performance, skill masteries, and curriculum roadmaps
 * to generate actionable, personalized next-step learning recommendations.
 */

/**
 * Guarantees every recommendation object satisfies the complete CareerOS contract:
 * title/name, description/reason, difficulty/priority, action, link/targetUrl, topic, module, resource.
 */
export function normalizeRecommendation(rec, defaultCareer = 'full-stack-developer') {
  if (!rec || typeof rec !== 'object') return null;
  const career = String(defaultCareer).toLowerCase().trim();
  const title = String(rec.title || rec.name || 'Recommended Learning Action').trim();
  const desc = String(rec.description || rec.reason || 'Continue your curriculum progress with CareerOS.').trim();
  const link = String(rec.link || rec.targetUrl || `/careers/${career}/roadmap`).trim();
  const priority = ['high', 'medium', 'low'].includes(String(rec.priority).toLowerCase())
    ? String(rec.priority).toLowerCase()
    : 'medium';
  const difficulty = String(
    rec.difficulty || (priority === 'high' ? 'Intermediate' : 'Beginner')
  ).trim();
  const action = String(rec.action || 'Continue Learning').trim();
  const topic = String(rec.topic || '').trim();
  const moduleSlug = String(rec.module || '').trim();
  const resource = String(rec.resource || '').trim();
  const type = String(rec.type || 'next_module').trim();

  return {
    type,
    title,
    name: title,
    description: desc,
    reason: desc,
    difficulty,
    priority,
    action,
    link,
    targetUrl: link,
    topic,
    module: moduleSlug,
    resource
  };
}

/**
 * Generates personalized recommendations based on an assessment evaluation
 */
export async function generateAssessmentRecommendations({
  career,
  module: modSlug,
  gradingResult,
  assessment = {}
}) {
  const recommendations = [];
  const careerSlug = String(career).toLowerCase().trim();
  const moduleSlug = String(modSlug).toLowerCase().trim();
  const assessDifficulty = assessment.difficulty
    ? assessment.difficulty.charAt(0).toUpperCase() + assessment.difficulty.slice(1).toLowerCase()
    : 'Intermediate';

  // 1. Identify weak topics (< 65%)
  const weakTopics = (gradingResult.topicPerformance || []).filter(t => t.percentage < 65);

  // Remediation recommendations for weak topics
  for (const topic of weakTopics) {
    const topicName = topic.name || 'Core Concepts';
    const reviewDesc = `You scored ${topic.percentage}% on ${topicName} in this assessment. Review the concept notes to reinforce your understanding.`;
    recommendations.push(normalizeRecommendation({
      type: 'review_topic',
      title: `Review Core Theory: ${topicName}`,
      name: `Review Core Theory: ${topicName}`,
      description: reviewDesc,
      reason: reviewDesc,
      difficulty: assessDifficulty,
      priority: 'high',
      action: 'Read Concept Notes',
      link: `/learn/${careerSlug}/${moduleSlug}`,
      targetUrl: `/learn/${careerSlug}/${moduleSlug}`,
      topic: topicName,
      module: moduleSlug,
      resource: ''
    }, careerSlug));

    const practiceDesc = `Reinforce your understanding of ${topicName} with hands-on coding challenges and practical exercises.`;
    recommendations.push(normalizeRecommendation({
      type: 'practice_challenge',
      title: `Practice Hands-on: ${topicName}`,
      name: `Practice Hands-on: ${topicName}`,
      description: practiceDesc,
      reason: practiceDesc,
      difficulty: assessDifficulty,
      priority: 'high',
      action: 'Solve Challenge',
      link: `/learn/${careerSlug}/${moduleSlug}`,
      targetUrl: `/learn/${careerSlug}/${moduleSlug}`,
      topic: topicName,
      module: moduleSlug,
      resource: ''
    }, careerSlug));
  }

  // 2. Progression recommendations if passed strongly
  if (gradingResult.passed && weakTopics.length === 0) {
    const advanceDesc = `High mastery demonstrated (${gradingResult.percentage}% score across all concepts). Advance to the next milestone in your curriculum.`;
    recommendations.push(normalizeRecommendation({
      type: 'next_module',
      title: 'Advance to Next Roadmap Milestone',
      name: 'Advance to Next Roadmap Milestone',
      description: advanceDesc,
      reason: advanceDesc,
      difficulty: assessDifficulty,
      priority: 'medium',
      action: 'Continue Roadmap',
      link: `/careers/${careerSlug}/roadmap`,
      targetUrl: `/careers/${careerSlug}/roadmap`,
      topic: assessment.topic || 'Curriculum Milestone',
      module: moduleSlug,
      resource: ''
    }, careerSlug));

    const projectDesc = 'Solidify your verified skills by building a real-world portfolio project based on these concepts.';
    recommendations.push(normalizeRecommendation({
      type: 'project',
      title: 'Apply Concepts in a Portfolio Mini-Project',
      name: 'Apply Concepts in a Portfolio Mini-Project',
      description: projectDesc,
      reason: projectDesc,
      difficulty: 'Intermediate',
      priority: 'medium',
      action: 'Build Project',
      link: `/learn/${careerSlug}/${moduleSlug}`,
      targetUrl: `/learn/${careerSlug}/${moduleSlug}`,
      topic: 'Mini Project',
      module: moduleSlug,
      resource: ''
    }, careerSlug));
  } else if (!gradingResult.passed) {
    const assessTitle = assessment.title || 'Assessment';
    const retestDesc = `Review the flagged explanations and retake the evaluation to lift your mastery rating above ${assessment.passingScore || 70}%.`;
    recommendations.push(normalizeRecommendation({
      type: 'retest',
      title: `Retake ${assessTitle}`,
      name: `Retake ${assessTitle}`,
      description: retestDesc,
      reason: retestDesc,
      difficulty: assessDifficulty,
      priority: 'medium',
      action: 'Retest When Ready',
      link: `/assessments/${assessment.assessmentId || ''}`,
      targetUrl: `/assessments/${assessment.assessmentId || ''}`,
      topic: assessment.topic || 'Assessment',
      module: moduleSlug,
      resource: ''
    }, careerSlug));
  }

  return recommendations;
}

/**
 * Aggregates comprehensive student learning diagnostics (for Helping AI context & Dashboard)
 */
export async function getStudentLearningDiagnostics(userId, careerSlug = 'full-stack-developer') {
  if (!userId) return null;

  const isDbConnected = mongoose.connection.readyState === 1;
  const career = String(careerSlug).toLowerCase().trim();

  let attempts = [];
  let masteries = [];
  let userProgress = null;
  let careerDoc = null;

  if (isDbConnected) {
    try {
      [attempts, masteries, userProgress, careerDoc] = await Promise.all([
        AssessmentAttempt.find({ user: userId, career })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
        SkillMastery.find({ user: userId, career })
          .sort({ masteryPercentage: 1 })
          .lean(),
        Progress.findOne({ user: userId, careerSlug: career }).lean(),
        Career.findOne({ slug: career }).lean()
      ]);
    } catch (err) {
      console.warn('[Learning Diagnostics DB Error]:', err.message);
    }
  }

  if (!attempts.length) {
    attempts = memoryAssessmentAttempts
      .filter(a => String(a.user) === String(userId) && a.career === career)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 10);
  }

  if (!masteries.length) {
    masteries = memorySkillMasteries
      .filter(m => String(m.user) === String(userId) && m.career === career)
      .sort((a, b) => (a.masteryPercentage || 0) - (b.masteryPercentage || 0));
  }

  if (!userProgress) {
    userProgress = memoryProgress.find(
      p => String(p.user) === String(userId) && p.careerSlug === career
    ) || null;
  }

  if (!careerDoc) {
    careerDoc = memoryCareers.find(c => c.slug === career) || null;
  }

  // Extract roadmap modules from career catalog
  const allModules = [];
  if (careerDoc?.roadmapPhases) {
    for (const phase of careerDoc.roadmapPhases) {
      for (const subject of (phase.subjects || [])) {
        for (const mod of (subject.modules || [])) {
          allModules.push({
            slug: mod.slug,
            title: mod.title,
            phaseTitle: phase.title,
            difficulty: mod.difficulty || 'Beginner'
          });
        }
      }
    }
  }

  // Strong vs weak areas
  const strongAreas = masteries.filter(m => m.masteryPercentage >= 75).map(m => m.skillName);
  const weakAreas = masteries.filter(m => m.masteryPercentage < 60).map(m => m.skillName);

  const recentAttemptsCount = attempts.length;
  const averageScore = recentAttemptsCount > 0
    ? Math.round(attempts.reduce((acc, a) => acc + (a.percentage || 0), 0) / recentAttemptsCount)
    : 0;

  const latestAttempt = attempts[0] || null;

  // Active recommendations resolution
  let activeRecommendations = [];

  if (latestAttempt?.recommendations?.length) {
    activeRecommendations = latestAttempt.recommendations
      .map(r => normalizeRecommendation(r, career))
      .filter(Boolean);
  }

  // If no attempt recommendations exist, derive from actual user progress & roadmap state
  if (!activeRecommendations.length) {
    const completedModules = userProgress?.completedModules || [];
    const lastActiveSlug = userProgress?.lastActiveModule || '';
    const activeMod = allModules.find(m => m.slug === lastActiveSlug);
    const firstMod = allModules[0] || {
      slug: 'javascript-core',
      title: 'JavaScript Core & Execution Context',
      difficulty: 'Beginner'
    };

    if (activeMod && !completedModules.includes(activeMod.slug)) {
      // User is in the middle of an active module
      const desc = `Continue learning ${activeMod.title}. Complete lessons and prepare for the module assessment.`;
      activeRecommendations.push(normalizeRecommendation({
        type: 'next_module',
        title: `Continue: ${activeMod.title}`,
        name: `Continue: ${activeMod.title}`,
        description: desc,
        reason: desc,
        difficulty: activeMod.difficulty || 'Beginner',
        priority: 'medium',
        action: 'Continue Learning',
        link: `/learn/${career}/${activeMod.slug}`,
        targetUrl: `/learn/${career}/${activeMod.slug}`,
        topic: activeMod.title,
        module: activeMod.slug,
        resource: ''
      }, career));
    } else if (completedModules.length > 0) {
      // Find the first uncompleted module
      const nextUncompleted = allModules.find(m => !completedModules.includes(m.slug));
      if (nextUncompleted) {
        const desc = `You completed earlier milestones. Advance to ${nextUncompleted.title} on your roadmap.`;
        activeRecommendations.push(normalizeRecommendation({
          type: 'next_module',
          title: `Start Module: ${nextUncompleted.title}`,
          name: `Start Module: ${nextUncompleted.title}`,
          description: desc,
          reason: desc,
          difficulty: nextUncompleted.difficulty || 'Intermediate',
          priority: 'medium',
          action: 'Start Module',
          link: `/learn/${career}/${nextUncompleted.slug}`,
          targetUrl: `/learn/${career}/${nextUncompleted.slug}`,
          topic: nextUncompleted.title,
          module: nextUncompleted.slug,
          resource: ''
        }, career));
      }
    }

    // Default roadmap foundations starting point (valid for learners at beginning of roadmap)
    if (!activeRecommendations.length) {
      const desc = `Start with core module concepts in ${firstMod.title} and take your first assessment.`;
      activeRecommendations.push(normalizeRecommendation({
        type: 'next_module',
        title: 'Begin Roadmap Foundations',
        name: 'Begin Roadmap Foundations',
        description: desc,
        reason: desc,
        difficulty: firstMod.difficulty || 'Beginner',
        priority: 'medium',
        action: 'Start Learning',
        link: `/learn/${career}/${firstMod.slug}`,
        targetUrl: `/learn/${career}/${firstMod.slug}`,
        topic: firstMod.title,
        module: firstMod.slug,
        resource: ''
      }, career));
    }
  }

  return {
    career,
    totalAttempts: recentAttemptsCount,
    totalAssessmentsAttempted: recentAttemptsCount,
    averageScore,
    strongTopics: strongAreas,
    strongAreas,
    decliningTopics: weakAreas,
    weakAreas,
    masteries: masteries.map(m => ({
      skill: m.skillName,
      mastery: m.masteryPercentage,
      confidence: m.confidence,
      trend: m.trend,
      lastScore: m.lastScore
    })),
    recentAttempts: attempts.slice(0, 5).map(a => ({
      attemptId: a.attemptId,
      assessmentTitle: a.assessmentTitle,
      percentage: a.percentage,
      passed: a.passed,
      submittedAt: a.submittedAt
    })),
    recommendations: activeRecommendations
  };
}

export { generateAssessmentRecommendations as generateLearningRecommendations };

export default {
  generateAssessmentRecommendations,
  generateLearningRecommendations: generateAssessmentRecommendations,
  getStudentLearningDiagnostics,
  normalizeRecommendation
};

