/**
 * CareerOS — Grading Engine Service (Day 11)
 * 
 * Authoritative server-side evaluation of submitted assessment answers.
 * Calculates score, percentage, correct/incorrect/skipped counts,
 * and generates topic/skill diagnostic breakdowns.
 * 
 * SECURITY: All grading is strictly server-side. Correct answers are never
 * revealed or trusted from client requests.
 */

/**
 * Checks if two answer arrays match accurately (supports single & multi-select)
 */
function arraysEqual(a = [], b = []) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((val, index) => val === sortedB[index]);
}

/**
 * Grade student submission against authoritative question definitions
 */
export function gradeAssessmentSubmission({ assessment, questions = [], submittedAnswers = [] }) {
  if (!assessment) {
    throw new Error('Assessment definition is required for grading');
  }

  const questionMap = new Map();
  questions.forEach(q => {
    questionMap.set(String(q.questionId), q);
  });

  const submissionMap = new Map();
  submittedAnswers.forEach(ans => {
    submissionMap.set(String(ans.questionId), ans.selectedAnswers || []);
  });

  let totalScore = 0;
  let maxPossibleScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  const gradedAnswers = [];
  const reviewItems = [];
  const topicStats = new Map();
  const skillStats = new Map();

  for (const question of questions) {
    const qId = String(question.questionId);
    const selected = submissionMap.get(qId) || [];
    const correctKeys = question.correctAnswers || [];
    const maxPoints = question.points || 10;
    maxPossibleScore += maxPoints;

    const isSkipped = !selected || selected.length === 0;
    const isCorrect = !isSkipped && arraysEqual(selected, correctKeys);
    const pointsAwarded = isCorrect ? maxPoints : 0;

    totalScore += pointsAwarded;

    if (isSkipped) {
      skippedCount++;
    } else if (isCorrect) {
      correctCount++;
    } else {
      incorrectCount++;
    }

    // Record answer result
    gradedAnswers.push({
      questionId: qId,
      selectedAnswers: selected,
      isCorrect,
      pointsAwarded,
      maxPoints
    });

    // Detailed review item for post-submission review mode
    reviewItems.push({
      questionId: qId,
      text: question.text,
      codeSnippet: question.codeSnippet || '',
      type: question.type,
      options: question.options,
      selectedAnswers: selected,
      correctAnswers: correctKeys,
      isCorrect,
      explanation: question.explanation || '',
      difficulty: question.difficulty,
      topic: question.topic,
      skills: question.skills || [],
      resourceRef: question.resourceRef || ''
    });

    // 1. Topic Diagnostic tracking
    const topic = question.topic || 'General';
    if (!topicStats.has(topic)) {
      topicStats.set(topic, { total: 0, correct: 0 });
    }
    const tStat = topicStats.get(topic);
    tStat.total += 1;
    if (isCorrect) tStat.correct += 1;

    // 2. Skill Diagnostic tracking
    const skillsList = question.skills?.length ? question.skills : ['JavaScript'];
    for (const skill of skillsList) {
      if (!skillStats.has(skill)) {
        skillStats.set(skill, { total: 0, correct: 0 });
      }
      const sStat = skillStats.get(skill);
      sStat.total += 1;
      if (isCorrect) sStat.correct += 1;
    }
  }

  const percentage = maxPossibleScore > 0
    ? Math.round((totalScore / maxPossibleScore) * 100)
    : 0;

  const passingScore = assessment.passingScore !== undefined ? assessment.passingScore : 70;
  const passed = percentage >= passingScore;

  // Format topic performance breakdown
  const topicPerformance = Array.from(topicStats.entries()).map(([name, stat]) => {
    const topicPct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
    let status = 'needs_review';
    if (topicPct >= 80) status = 'mastered';
    else if (topicPct >= 60) status = 'proficient';

    return {
      name,
      total: stat.total,
      correct: stat.correct,
      percentage: topicPct,
      status
    };
  });

  // Format skill performance breakdown
  const skillPerformance = Array.from(skillStats.entries()).map(([name, stat]) => {
    const skillPct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
    let status = 'needs_review';
    if (skillPct >= 80) status = 'mastered';
    else if (skillPct >= 60) status = 'proficient';

    return {
      name,
      total: stat.total,
      correct: stat.correct,
      percentage: skillPct,
      status
    };
  });

  return {
    score: totalScore,
    totalPoints: maxPossibleScore,
    percentage,
    passed,
    passingScore,
    correctCount,
    incorrectCount,
    skippedCount,
    answers: gradedAnswers,
    topicPerformance,
    skillPerformance,
    reviewItems
  };
}

export { gradeAssessmentSubmission as gradeAssessmentAttempt };

export default {
  gradeAssessmentSubmission,
  gradeAssessmentAttempt: gradeAssessmentSubmission
};
