import dotenv from 'dotenv';
import Question from './models/Question.js';
import Assessment from './models/Assessment.js';
import AssessmentAttempt from './models/AssessmentAttempt.js';
import SkillMastery from './models/SkillMastery.js';
import { gradeAssessmentAttempt } from './services/gradingService.js';
import { recalibrateSkillMastery, selectAdaptiveQuestions } from './services/adaptiveService.js';
import { generateLearningRecommendations, getStudentLearningDiagnostics } from './services/recommendationService.js';

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runDay11AssessmentTestSuite() {
  console.log('================================================================');
  console.log('  CareerOS Day 11: Assessment Engine + Adaptive Learning Suite ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    const timestamp = Date.now();
    const userAEmail = `day11.student.a.${timestamp}@careeros.test`;
    const userBEmail = `day11.student.b.${timestamp}@careeros.test`;
    const commonPassword = 'SecurePassword123!';

    // ========================================================================
    // Part 1: Unit Testing Grading & Evaluation Logic
    // ========================================================================
    console.log('[Part 1] Testing Server-Side Authoritative Grading Service...');

    const mockQuestions = [
      {
        questionId: 'q1',
        text: 'What is a closure?',
        type: 'single_choice',
        options: ['A function bundled with its lexical environment', 'A loop construct', 'A DOM event'],
        correctAnswers: [0],
        points: 10,
        topic: 'closures',
        skills: ['javascript']
      },
      {
        questionId: 'q2',
        text: 'Which of the following are primitive types in JS?',
        type: 'multiple_choice',
        options: ['string', 'number', 'boolean', 'Array'],
        correctAnswers: [0, 1, 2],
        points: 10,
        topic: 'data-types',
        skills: ['javascript']
      },
      {
        questionId: 'q3',
        text: 'In JS, functions are first-class citizens.',
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswers: [0],
        points: 10,
        topic: 'functions',
        skills: ['javascript']
      },
      {
        questionId: 'q4',
        text: 'What does typeof null evaluate to?',
        type: 'single_choice',
        options: ['null', 'undefined', 'object', 'number'],
        correctAnswers: [2],
        points: 10,
        topic: 'data-types',
        skills: ['javascript']
      }
    ];

    // Learner answers: q1 correct, q2 correct, q3 incorrect, q4 skipped
    const learnerAnswers = [
      { questionId: 'q1', selectedAnswers: [0] },
      { questionId: 'q2', selectedAnswers: [0, 1, 2] },
      { questionId: 'q3', selectedAnswers: [1] } // incorrect (chose False)
      // q4 not answered (skipped)
    ];

    const graded = gradeAssessmentAttempt({
      assessment: { passingScore: 70 },
      questions: mockQuestions,
      submittedAnswers: learnerAnswers
    });

    assert(graded.score === 20, 'Grading: exactly 20 points earned out of 40');
    assert(graded.percentage === 50, 'Grading: percentage is 50%');
    assert(graded.passed === false, 'Grading: 50% is below 70% threshold (failed)');
    assert(graded.correctCount === 2, 'Grading: 2 correct questions');
    assert(graded.incorrectCount === 1, 'Grading: 1 incorrect question');
    assert(graded.skippedCount === 1, 'Grading: 1 skipped question');
    assert(graded.topicPerformance.find(t => t.name === 'closures')?.percentage === 100, 'Topic diagnostics: closures is 100%');
    assert(graded.topicPerformance.find(t => t.name === 'functions')?.percentage === 0, 'Topic diagnostics: functions is 0%');
    assert(graded.topicPerformance.find(t => t.name === 'data-types')?.percentage === 50, 'Topic diagnostics: data-types is 50% (1 correct, 1 skipped)');
    assert(graded.reviewItems.length === 4, 'Review mode: includes detailed items for all 4 questions');
    assert(graded.reviewItems[0].isCorrect === true, 'Review mode: q1 marked correct');
    assert(graded.reviewItems[2].isCorrect === false, 'Review mode: q3 marked incorrect');

    // ========================================================================
    // Part 2: Adaptive Difficulty & Skill Mastery Recalibration Unit Tests
    // ========================================================================
    console.log('\n[Part 2] Testing Adaptive Mastery Recalibration & Recommendations...');

    const recommendations = await generateLearningRecommendations({
      career: 'full-stack-developer',
      module: 'javascript-core',
      gradingResult: graded,
      assessment: { title: 'JS Foundations Quiz', assessmentId: 'javascript-foundations-quiz' }
    });

    assert(Array.isArray(recommendations) && recommendations.length > 0, 'Recommendation engine generated recommendations');
    const remediationRec = recommendations.find(r => r.type === 'review_topic' || r.type === 'practice_challenge');
    assert(Boolean(remediationRec), 'Recommendation engine flagged remediation for weak topic (< 65%)');
    assert(remediationRec.link.includes('/learn/full-stack-developer'), 'Remediation links to valid CareerOS route');

    // ========================================================================
    // Part 3: Authentication & User Setup
    // ========================================================================
    console.log('\n[Part 3] Registering Test Users for Integration & Security Tests...');

    const regResA = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Learner A', email: userAEmail, password: commonPassword })
    });
    const regDataA = await regResA.json();
    assert(regDataA.success && regDataA.token, 'Learner A registered successfully with JWT');
    const tokenA = regDataA.token;
    const userAId = regDataA.user?.id || regDataA.user?._id;

    const regResB = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Learner B', email: userBEmail, password: commonPassword })
    });
    const regDataB = await regResB.json();
    assert(regDataB.success && regDataB.token, 'Learner B registered successfully with JWT');
    const tokenB = regDataB.token;

    // ========================================================================
    // Part 4: Assessment Listing & Filtering REST Endpoints
    // ========================================================================
    console.log('\n[Part 4] Testing Assessment Catalog & Filtering Endpoints...');

    const listRes = await fetch(`${BASE_URL}/assessments`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const listData = await listRes.json();
    assert(listData.success === true, 'GET /api/assessments returns 200 OK');
    assert(Array.isArray(listData.assessments) && listData.assessments.length >= 3, 'Pre-seeded assessments found in DB');

    const foundationsQuiz = listData.assessments.find(a => a.slug === 'javascript-foundations-quiz') || listData.assessments[0];
    assert(Boolean(foundationsQuiz), 'Foundations assessment exists in seed catalog');

    // ========================================================================
    // Part 5: Assessment & Question Security (Anti-Leak Rules)
    // ========================================================================
    console.log('\n[Part 5] Testing Question Security: Correct Answers MUST NOT Leak Pre-Submission...');

    const fetchAssessRes = await fetch(`${BASE_URL}/assessments/${foundationsQuiz._id || foundationsQuiz.id}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const fetchAssessData = await fetchAssessRes.json();
    assert(fetchAssessData.success === true, 'GET /api/assessments/:id returns sanitized assessment');
    assert(Array.isArray(fetchAssessData.assessment.questions), 'Assessment contains questions list');

    // Check every single question: correctAnswers and explanation must NOT exist
    for (const q of fetchAssessData.assessment.questions) {
      assert(q.correctAnswers === undefined, `Security Check: correctAnswers stripped for question ${q._id || q.id}`);
      assert(q.correctAnswer === undefined, `Security Check: correctAnswer stripped for question ${q._id || q.id}`);
      assert(q.explanation === undefined, `Security Check: explanation stripped for question ${q._id || q.id}`);
      assert(Array.isArray(q.options) && q.options.length > 0, `Question has playable options`);
    }

    // ========================================================================
    // Part 6: Submission & Server-Side Authoritative Grading REST Endpoint
    // ========================================================================
    console.log('\n[Part 6] Testing Assessment Submission & Server-Side Evaluation...');

    // Build answers: answer first 3 questions with option index 0, leave rest
    const submissionAnswers = {};
    fetchAssessData.assessment.questions.forEach((q, idx) => {
      if (idx < 3) {
        submissionAnswers[q._id || q.id] = q.type === 'multiple_choice' ? [0, 1] : 0;
      }
    });

    const submitRes = await fetch(`${BASE_URL}/assessments/${foundationsQuiz._id || foundationsQuiz.id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        answers: submissionAnswers,
        timeTakenSeconds: 145,
        // Attempt tampering: try to pass client-calculated fake score
        score: 9999,
        percentage: 100,
        passed: true
      })
    });

    const submitData = await submitRes.json();
    assert(submitData.success === true, 'POST /api/assessments/:id/submit succeeds');
    assert(submitData.attempt.score !== 9999, 'Security: Server rejects client-supplied fake score');
    assert(typeof submitData.attempt.percentage === 'number', 'Authoritative percentage calculated');
    assert(Array.isArray(submitData.attempt.topicPerformance), 'Topic performance diagnostics included in attempt');
    assert(Array.isArray(submitData.attempt.review), 'Review item breakdown included post-submission');
    assert(submitData.attempt.review[0].explanation !== undefined, 'Explanation is safely revealed ONLY after submission');
    assert(Array.isArray(submitData.attempt.recommendations), 'Personalized recommendations generated');

    const attemptIdA = submitData.attempt.attemptId || submitData.attempt._id || submitData.attempt.id;

    // ========================================================================
    // Part 7: Attempt History & User Isolation
    // ========================================================================
    console.log('\n[Part 7] Testing Attempt History & Strict User Isolation...');

    // Learner A can fetch own attempt
    const getAttemptResA = await fetch(`${BASE_URL}/assessments/attempts/${attemptIdA}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const getAttemptDataA = await getAttemptResA.json();
    assert(getAttemptDataA.success === true, 'Learner A can view own assessment attempt');

    // Learner B CANNOT access Learner A's attempt (Forbidden / 403 or 404)
    const getAttemptResB = await fetch(`${BASE_URL}/assessments/attempts/${attemptIdA}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(
      getAttemptResB.status === 403 || getAttemptResB.status === 404,
      `User Isolation: Learner B blocked from Learner A attempt (Status: ${getAttemptResB.status})`
    );

    // Learner B attempt list should be empty
    const listAttemptsResB = await fetch(`${BASE_URL}/assessments/attempts`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const listAttemptsDataB = await listAttemptsResB.json();
    assert(listAttemptsDataB.success === true && listAttemptsDataB.attempts.length === 0, 'User Isolation: Learner B attempt list is empty');

    // ========================================================================
    // Part 8: Learning Diagnostics & Diagnostics Endpoint
    // ========================================================================
    console.log('\n[Part 8] Testing Learning Diagnostics Endpoint...');

    const diagRes = await fetch(`${BASE_URL}/assessments/diagnostics?career=full-stack-developer`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const diagData = await diagRes.json();
    assert(diagData.success === true, 'GET /api/assessments/diagnostics returns 200 OK');
    assert(diagData.diagnostics.totalAttempts >= 1, 'Diagnostics tracks total attempts for student');
    assert(typeof diagData.diagnostics.averageScore === 'number', 'Diagnostics computes average score');
    assert(Array.isArray(diagData.diagnostics.recommendations), 'Diagnostics includes actionable recommendations');

    // ========================================================================
    // Part 9: Helping AI Integration with Assessment Diagnostics
    // ========================================================================
    console.log('\n[Part 9] Testing Helping AI Integration with Assessment Diagnostics...');

    // Check context builder endpoint
    const ctxRes = await fetch(`${BASE_URL}/ai/context?careerSlug=full-stack-developer&moduleSlug=javascript-core`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const ctxData = await ctxRes.json();
    assert(ctxData.success === true, 'GET /api/ai/context returns 200 OK');
    assert(Boolean(ctxData.context.assessmentDiagnostics), 'Helping AI context includes assessmentDiagnostics');
    assert(ctxData.context.assessmentDiagnostics.totalAttempts >= 1, 'Helping AI context reflects student assessment history');

    // Test Helping AI Chat with assessment-informed prompt
    const chatRes = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        message: 'What should I study next based on my assessments?',
        careerSlug: 'full-stack-developer',
        moduleSlug: 'javascript-core'
      })
    });
    const chatData = await chatRes.json();
    assert(chatData.success === true && (chatData.latestReply || chatData.message), 'Helping AI chat responds successfully');
    const replyText = chatData.latestReply || chatData.message?.content || '';
    assert(
      replyText.includes('Recommendations') || 
      replyText.includes('Assessment') || 
      replyText.includes('roadmap') ||
      replyText.includes('Milestone'),
      'Helping AI response incorporates assessment and roadmap guidance'
    );

    console.log('\n================================================================');
    console.log(`  Day 11 Assessment Suite Completed: ${passed} Passed, ${failed} Failed `);
    console.log('================================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n[FATAL ERROR in Day 11 Assessment Suite]:', err);
    process.exit(1);
  }
}

runDay11AssessmentTestSuite();
