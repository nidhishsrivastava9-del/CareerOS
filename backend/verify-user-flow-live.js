import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

async function testFullUserFlowLive() {
  console.log('================================================================');
  console.log('  CareerOS Live User Flow & Recommendation Verification        ');
  console.log('================================================================\n');

  function assert(condition, message) {
    if (!condition) {
      console.error(`[FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
    console.log(`[PASS] ${message}`);
  }

  // 1. Register a new student
  const email = `live.flow.student.${Date.now()}@careeros.test`;
  const password = 'SecurePassword123!';
  console.log(`[Step 1] Registering student: ${email}...`);

  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Taylor Student',
      email,
      password
    })
  });
  const regData = await regRes.json();
  assert(regRes.status === 201 && regData.token, 'Student registered successfully with token');
  const token = regData.token;

  // 2. Select Career from Catalog
  console.log('\n[Step 2] Fetching Career Catalog (/api/careers)...');
  const careerRes = await fetch(`${BASE_URL}/careers`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const careerData = await careerRes.json();
  assert(careerRes.status === 200 && Array.isArray(careerData.careers), 'Career catalog fetched');
  const fullStack = careerData.careers.find(c => c.slug === 'full-stack-developer');
  assert(Boolean(fullStack), 'Found Full Stack Developer in catalog');

  // 3. View Roadmap
  console.log('\n[Step 3] Fetching Roadmap for Full Stack Developer...');
  const roadmapRes = await fetch(`${BASE_URL}/careers/full-stack-developer/roadmap`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const roadmapData = await roadmapRes.json();
  assert(roadmapRes.status === 200 && Array.isArray(roadmapData.roadmapPhases), 'Roadmap fetched');
  console.log(`Found ${roadmapData.roadmapPhases.length} phases in roadmap.`);

  // 4. Fetch Available Assessments
  console.log('\n[Step 4] Fetching Available Assessments...');
  const assessRes = await fetch(`${BASE_URL}/assessments?career=full-stack-developer`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const assessData = await assessRes.json();
  assert(assessRes.status === 200 && assessData.assessments?.length > 0, 'Found published assessments');
  const quiz = assessData.assessments[0];
  console.log(`Target Assessment: "${quiz.title}" (${quiz.assessmentId})`);

  // 5. Fetch Questions for Taking the Assessment
  console.log('\n[Step 5] Loading sanitized assessment questions...');
  const takeRes = await fetch(`${BASE_URL}/assessments/${quiz.assessmentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const takeData = await takeRes.json();
  assert(takeRes.status === 200 && takeData.questions?.length > 0, 'Sanitized questions loaded');
  console.log(`Loaded ${takeData.questions.length} questions for evaluation.`);

  // 6. Submit Assessment with deliberate weak area to trigger remediation
  console.log('\n[Step 6] Submitting Assessment answers (failing 1 question)...');
  const answers = takeData.questions.map((q, idx) => ({
    questionId: q.questionId || q.id,
    selectedAnswers: idx === 0 ? [99] : [0] // Deliberately miss first question
  }));

  const submitRes = await fetch(`${BASE_URL}/assessments/${quiz.assessmentId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ answers, timeTakenSeconds: 45 })
  });
  const submitData = await submitRes.json();
  assert(submitRes.status === 200 && submitData.success, 'Assessment submitted and server graded');
  console.log(`Score: ${submitData.attempt.score}/${submitData.attempt.totalPoints} (${submitData.attempt.percentage}%) Passed: ${submitData.attempt.passed}`);

  // 7. Verify Recommendations in Assessment Result
  console.log('\n[Step 7] Inspecting Assessment Results & Recommendations...');
  const recommendations = submitData.attempt.recommendations;
  assert(Array.isArray(recommendations) && recommendations.length > 0, 'Recommendations present in attempt');
  
  for (const [i, rec] of recommendations.entries()) {
    console.log(`\n  Recommendation ${i + 1}:`);
    console.log(`  - Title: "${rec.title}"`);
    console.log(`  - Priority: [${rec.priority?.toUpperCase()}]`);
    console.log(`  - Difficulty: ${rec.difficulty}`);
    console.log(`  - Action: "${rec.action}"`);
    console.log(`  - Description: "${rec.description}"`);
    console.log(`  - Target URL: ${rec.targetUrl || rec.link}`);

    assert(rec.title && !rec.title.includes('undefined'), `Rec ${i + 1} has valid title`);
    assert(rec.description && !rec.description.includes('undefined'), `Rec ${i + 1} has valid description (NO 'undefined')`);
    assert(rec.action && !rec.action.includes('undefined'), `Rec ${i + 1} has valid action`);
    assert(Boolean(rec.targetUrl || rec.link), `Rec ${i + 1} has valid destination link`);
  }

  // 8. Verify Learning Diagnostics
  console.log('\n[Step 8] Fetching Learning Diagnostics (/api/assessments/diagnostics)...');
  const diagRes = await fetch(`${BASE_URL}/assessments/diagnostics?careerSlug=full-stack-developer`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const diagData = await diagRes.json();
  assert(diagRes.status === 200 && diagData.diagnostics, 'Diagnostics retrieved successfully');
  console.log(`Average score: ${diagData.diagnostics.averageScore}%, Attempts: ${diagData.diagnostics.totalAttempts}`);
  assert(diagData.diagnostics.recommendations?.length > 0, 'Diagnostics contains active recommendations');
  const firstDiagRec = diagData.diagnostics.recommendations[0];
  console.log(`Top Diagnostic Recommendation: "${firstDiagRec.title}": "${firstDiagRec.description}"`);
  assert(!firstDiagRec.description.includes('undefined'), 'Top recommendation description is NOT undefined');

  // 9. Ask Helping AI for Next Recommendations
  console.log('\n[Step 9] Asking Helping AI: "What should I study next based on my latest assessment?"...');
  const aiRes = await fetch(`${BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      message: 'What should I study next based on my latest assessment?',
      careerSlug: 'full-stack-developer',
      moduleSlug: 'javascript-core'
    })
  });
  const aiData = await aiRes.json();
  const aiReply = aiData.latestReply || aiData.reply;
  assert(aiRes.status === 200 && aiReply, 'Helping AI replied successfully');
  console.log('\n--- Helping AI Response ---');
  console.log(aiReply);
  console.log('---------------------------');

  assert(!aiReply.includes('undefined'), 'Helping AI response DOES NOT contain "undefined"');
  assert(aiReply.includes('Recommendations') || aiReply.includes('Next Recommended'), 'Helping AI includes recommendations section');

  console.log('\n================================================================');
  console.log('  LIVE USER FLOW & RECOMMENDATION VERIFICATION 100% PASSED!    ');
  console.log('================================================================');
}

testFullUserFlowLive().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
