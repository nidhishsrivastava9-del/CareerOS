import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { generateAssessmentRecommendations, getStudentLearningDiagnostics } from './services/recommendationService.js';
import { gradeAssessmentSubmission } from './services/gradingService.js';
import { QUESTIONS_SEED, ASSESSMENTS_SEED } from './data/questionBankSeedData.js';
import { buildUserContext } from './services/contextBuilder.js';
import { getAiProvider } from './services/aiProvider.js';

dotenv.config();

async function debug() {
  console.log('=== DEBUGGING RECOMMENDATION ENGINE ===');
  
  // Test 1: generateAssessmentRecommendations with a weak topic
  const testAssessment = ASSESSMENTS_SEED[0]; // js-core-foundations-quiz
  console.log('Assessment:', testAssessment.title, 'module:', testAssessment.module);
  
  const testQuestions = QUESTIONS_SEED.filter(q => testAssessment.questionIds.includes(q.questionId));
  console.log('Questions count:', testQuestions.length);
  
  // Submit answers where q-js-func-1 (Execution Context) is failed
  const submittedAnswers = [
    { questionId: 'q-js-func-1', selectedAnswers: [0] }, // incorrect (correct is 1)
    { questionId: 'q-js-func-2', selectedAnswers: [2] }, // correct (2)
    { questionId: 'q-js-tdz-1', selectedAnswers: [0] },  // correct (0)
    { questionId: 'q-js-eventloop-1', selectedAnswers: [0] } // correct
  ];
  
  const graded = gradeAssessmentSubmission({
    assessment: testAssessment,
    questions: testQuestions,
    submittedAnswers
  });
  
  console.log('\nGrading Result:');
  console.log('Score:', graded.score, '/', graded.totalPoints, 'Percentage:', graded.percentage, 'Passed:', graded.passed);
  console.log('Topic Performance:', JSON.stringify(graded.topicPerformance, null, 2));
  
  const recommendations = await generateAssessmentRecommendations({
    career: testAssessment.career,
    module: testAssessment.module,
    gradingResult: graded,
    assessment: testAssessment
  });
  
  console.log('\nGenerated Recommendations from Assessment:');
  console.log(JSON.stringify(recommendations, null, 2));

  // Test 2: getStudentLearningDiagnostics without any attempts
  console.log('\nTesting getStudentLearningDiagnostics (no attempts)...');
  const emptyDiag = await getStudentLearningDiagnostics('mock-user-123', 'full-stack-developer');
  console.log('Empty Diag Recommendations:');
  console.log(JSON.stringify(emptyDiag.recommendations, null, 2));

  // Test 3: What does contextBuilder and aiProvider output?
  const userContext = await buildUserContext('mock-user-123', {
    careerSlug: 'full-stack-developer',
    moduleSlug: 'javascript-core',
    message: 'What should I study next based on my latest assessment?'
  });
  console.log('\nUserContext recommendations:');
  console.log(JSON.stringify(userContext.recommendations, null, 2));

  const provider = getAiProvider();
  const reply = await provider.generateResponse({
    messages: [{ role: 'user', content: 'What should I study next based on my latest assessment?' }],
    systemPrompt: '',
    userContext
  });
  console.log('\nAI Provider Reply content:');
  console.log(reply.content);
}

debug().catch(console.error);
