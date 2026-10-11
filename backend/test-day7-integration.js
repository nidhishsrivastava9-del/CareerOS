import dotenv from 'dotenv';
import http from 'http';
import app from './server.js';

dotenv.config();

const TEST_PORT = 5055;
let serverInstance = null;
let BASE_URL = `http://127.0.0.1:${TEST_PORT}/api`;

async function startServer() {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/health');
    if (res.ok) {
      BASE_URL = 'http://127.0.0.1:5000/api';
      console.log(`[Test Runner]: Using active CareerOS server on ${BASE_URL}`);
      return;
    }
  } catch (err) {
    // Port 5000 not responding, fallback to starting on TEST_PORT
  }
  return new Promise((resolve) => {
    serverInstance = app.listen(TEST_PORT, () => {
      console.log(`[Test Runner]: Ephemeral CareerOS test server listening on port ${TEST_PORT}`);
      resolve();
    });
  });
}

async function stopServer() {
  if (serverInstance) {
    return new Promise((resolve) => {
      serverInstance.close(() => {
        console.log('[Test Runner]: Test server stopped.');
        resolve();
      });
    });
  }
}

async function runDay7TestSuite() {
  console.log('================================================================');
  console.log('   CareerOS Day 7: Career Catalog & Learning Hub Test Suite     ');
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

  await startServer();

  try {
    const timestamp = Date.now();
    const userAEmail = `alex.day7.${timestamp}@example.com`;
    const userBEmail = `sam.day7.${timestamp}@example.com`;
    const commonPassword = 'SecurePassword123!';

    // 1. Health check
    console.log('[Step 1] Verifying System Health Check...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.success, 'GET /api/health returned 200 OK');

    // 2. Register User A & User B
    console.log('\n[Step 2] Authenticating User A (Alex Rivera)...');
    const regARes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alex Rivera', email: userAEmail, password: commonPassword })
    });
    const regAData = await regARes.json();
    assert(regARes.status === 201 && regAData.token, 'User A registered with status 201 and JWT');
    const tokenA = regAData.token;

    console.log('[Step 2.1] Authenticating User B (Sam Chen)...');
    const regBRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Sam Chen', email: userBEmail, password: commonPassword })
    });
    const regBData = await regBRes.json();
    assert(regBRes.status === 201 && regBData.token, 'User B registered with status 201 and JWT');
    const tokenB = regBData.token;

    // 3. Regression verification: Skills, Projects, Goals, DSA (Days 1-6)
    console.log('\n[Step 3] Regression Verification: Skills, Projects, Goals, DSA...');
    // Create skill for User A
    const skillRes = await fetch(`${BASE_URL}/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ name: 'TypeScript', category: 'Programming', progress: 85 })
    });
    const skillData = await skillRes.json();
    assert(skillRes.status === 201 && skillData.success, 'POST /api/skills created new skill for User A');

    // Create project for User A
    const projRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'CareerOS Platform',
        description: 'Student career learning operating system',
        techStack: ['React', 'Node.js', 'Express', 'Tailwind']
      })
    });
    const projData = await projRes.json();
    assert(projRes.status === 201 && projData.success, 'POST /api/projects created new project for User A');

    // Create goal for User A
    const goalRes = await fetch(`${BASE_URL}/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'Complete Day 7 Learning Hub Architecture',
        category: 'Development',
        priority: 'High'
      })
    });
    const goalData = await goalRes.json();
    assert(goalRes.status === 201 && goalData.success, 'POST /api/goals created new goal for User A');

    // Verify User B cannot see User A's skill
    const userBSkillsRes = await fetch(`${BASE_URL}/skills`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const userBSkillsData = await userBSkillsRes.json();
    const leakedSkill = (userBSkillsData.data || userBSkillsData.skills || []).find(s => s.name === 'TypeScript');
    assert(!leakedSkill, 'User Isolation: User B cannot see User A\'s newly created skill');

    // 4. Day 7 Career Catalog API verification
    console.log('\n[Step 4] Verifying Day 7 Career Catalog API...');
    const careersRes = await fetch(`${BASE_URL}/careers`);
    const careersData = await careersRes.json();
    assert(careersRes.status === 200 && careersData.success, 'GET /api/careers returned status 200 OK');
    assert(careersData.count >= 23, `Career Catalog contains all 23 required technical roles (Found: ${careersData.count})`);

    // Verify all 23 required career slugs exist in catalog
    const REQUIRED_SLUGS = [
      'software-developer',
      'frontend-developer',
      'backend-developer',
      'full-stack-developer',
      'mobile-developer',
      'ai-ml-engineer',
      'data-scientist',
      'data-analyst',
      'data-engineer',
      'generative-ai-engineer',
      'cybersecurity',
      'cloud-engineer',
      'devops-engineer',
      'sre',
      'network-engineer',
      'qa-engineer',
      'automation-test-engineer',
      'database-engineer',
      'ui-ux-designer',
      'embedded-systems-engineer',
      'iot-engineer',
      'blockchain-web3-developer',
      'game-developer'
    ];

    const catalogSlugs = careersData.careers.map(c => c.slug);
    for (const slug of REQUIRED_SLUGS) {
      assert(catalogSlugs.includes(slug), `Career slug "${slug}" exists in Career Catalog`);
    }

    // 5. Test search and category filtering
    console.log('\n[Step 5] Testing Search & Category Filters...');
    const searchRes = await fetch(`${BASE_URL}/careers?search=React`);
    const searchData = await searchRes.json();
    assert(searchData.success && searchData.careers.length > 0, 'GET /api/careers?search=React returns filtered careers');

    const catRes = await fetch(`${BASE_URL}/careers?category=Data%20%26%20Artificial%20Intelligence`);
    const catData = await catRes.json();
    assert(catData.success && catData.careers.length >= 4, 'GET /api/careers?category=Data & Artificial Intelligence returns AI/Data careers');

    // 6. Career Detail & Hierarchical Roadmap verification
    console.log('\n[Step 6] Verifying Career Overview & Hierarchical Roadmap...');
    const careerDetailRes = await fetch(`${BASE_URL}/careers/full-stack-developer`);
    const careerDetailData = await careerDetailRes.json();
    assert(careerDetailRes.status === 200 && careerDetailData.success, 'GET /api/careers/full-stack-developer returned 200 OK');
    assert(careerDetailData.career.title === 'Full Stack Developer', 'Career title matches "Full Stack Developer"');
    assert(careerDetailData.career.roadmapPhases.length >= 4, `Full Stack roadmap contains ${careerDetailData.career.roadmapPhases.length} phases`);

    const roadmapTreeRes = await fetch(`${BASE_URL}/careers/full-stack-developer/roadmap`);
    const roadmapTreeData = await roadmapTreeRes.json();
    assert(roadmapTreeRes.status === 200 && roadmapTreeData.success, 'GET /api/careers/full-stack-developer/roadmap returned hierarchical tree');
    assert(roadmapTreeData.roadmapPhases.length > 0, 'Roadmap tree contains hierarchical phases with subjects and modules');

    // 7. Learning Hub Module Detail & 7 Resource Types
    console.log('\n[Step 7] Verifying Learning Hub Module & 7 Resource Types...');
    const modRes = await fetch(`${BASE_URL}/careers/full-stack-developer/modules/javascript-core`);
    const modData = await modRes.json();
    assert(modRes.status === 200 && modData.success, 'GET /api/careers/full-stack-developer/modules/javascript-core returned 200 OK');
    assert(modData.module.title === 'JavaScript Core & Execution Context', 'Module title matches');
    assert(modData.module.learningObjectives && modData.module.learningObjectives.length > 0, 'Module has learning objectives');

    const resources = modData.module.resources || [];
    const resourceTypes = resources.map(r => r.type);
    assert(resourceTypes.includes('theory'), 'Module contains Theory resource');
    assert(resourceTypes.includes('notes'), 'Module contains Notes/Cheatsheet resource');
    assert(resourceTypes.includes('video'), 'Module contains Video resource with embed metadata');
    assert(resourceTypes.includes('quiz'), 'Module contains Quiz assessment resource');
    assert(resourceTypes.includes('pyq'), 'Module contains PYQ interview questions');
    assert(resourceTypes.includes('practice'), 'Module contains hands-on Practice challenge');
    assert(resourceTypes.includes('project'), 'Module contains Mini Project resource');

    // Verify Future Video Architecture metadata fields
    const videoRes = resources.find(r => r.type === 'video');
    assert(videoRes && videoRes.videoMetadata && videoRes.videoMetadata.platform, 'Video resource supports platform, duration, channel, and thumbnail');

    // 8. Learning Progress: Toggle Lesson, Quiz Assessment, Practice Challenge
    console.log('\n[Step 8] Verifying User Learning Progress (User A)...');
    // Initially User A progress is 0
    const progInitRes = await fetch(`${BASE_URL}/progress/full-stack-developer`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const progInitData = await progInitRes.json();
    assert(progInitRes.status === 200 && progInitData.success, 'GET /api/progress/full-stack-developer returned 200 OK');
    assert(progInitData.progress.overallPercentage === 0, 'Initial progress is 0%');

    // Mark Theory complete
    const theoryResId = resources.find(r => r.type === 'theory').id;
    const toggleRes = await fetch(`${BASE_URL}/progress/toggle-lesson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        careerSlug: 'full-stack-developer',
        moduleSlug: 'javascript-core',
        lessonId: theoryResId,
        completed: true
      })
    });
    const toggleData = await toggleRes.json();
    assert(toggleRes.status === 200 && toggleData.success, 'POST /api/progress/toggle-lesson marked theory as complete');
    assert(toggleData.progress.completedLessons.includes(String(theoryResId)), 'Completed lessons contains theory resource ID');
    assert(toggleData.progress.overallPercentage > 0, `Overall progress recalculated to ${toggleData.progress.overallPercentage}%`);

    // Submit Quiz score
    const quizResId = resources.find(r => r.type === 'quiz').id;
    const submitQuizRes = await fetch(`${BASE_URL}/progress/quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        careerSlug: 'full-stack-developer',
        moduleSlug: 'javascript-core',
        quizId: quizResId,
        score: 3,
        total: 3
      })
    });
    const submitQuizData = await submitQuizRes.json();
    assert(submitQuizRes.status === 200 && submitQuizData.success, 'POST /api/progress/quiz recorded assessment score');
    const recordedQuiz = submitQuizData.progress.quizScores.find(q => q.quizId === String(quizResId));
    assert(recordedQuiz && recordedQuiz.score === 3, 'Quiz score 3/3 successfully recorded in progress');

    // Complete practice challenge
    const practiceResId = resources.find(r => r.type === 'practice').id;
    const practiceTaskRes = await fetch(`${BASE_URL}/progress/practice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        careerSlug: 'full-stack-developer',
        moduleSlug: 'javascript-core',
        taskId: practiceResId
      })
    });
    const practiceTaskData = await practiceTaskRes.json();
    assert(practiceTaskRes.status === 200 && practiceTaskData.success, 'POST /api/progress/practice marked coding challenge complete');

    // 9. Verify User Isolation for Learning Progress
    console.log('\n[Step 9] Verifying User Isolation for Learning Progress...');
    const userBProgRes = await fetch(`${BASE_URL}/progress/full-stack-developer`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const userBProgData = await userBProgRes.json();
    assert(userBProgData.progress.overallPercentage === 0, 'User Isolation: User B starts with 0% progress');
    assert(userBProgData.progress.completedLessons.length === 0, 'User Isolation: User B has 0 completed lessons (User A\'s progress is isolated)');

    console.log('\n================================================================');
    console.log(`[DAY 7 TEST SUITE RESULT]: ALL ${passed} TESTS PASSED! (${failed} failed)`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n[DAY 7 TEST SUITE FAILURE]:', err.message);
  } finally {
    await stopServer();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runDay7TestSuite();
