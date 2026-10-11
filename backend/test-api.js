// Automated API Test Suite for CareerOS Day 4
const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('--- Starting CareerOS API Test Suite ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'GET /api/health returned 200 OK');
    assert(healthData.success === true && healthData.message === 'CareerOS API is running', 'Health response format matches requirement');

    // 2. Skills: GET
    const skillsRes = await fetch(`${BASE_URL}/api/skills`);
    const skillsData = await skillsRes.json();
    assert(skillsRes.status === 200, 'GET /api/skills returned 200 OK');
    assert(skillsData.success === true && Array.isArray(skillsData.data), 'Skills data is an array');
    const initialSkillsCount = skillsData.data.length;

    // 2. Skills: POST
    const createSkillRes = await fetch(`${BASE_URL}/api/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'TypeScript',
        category: 'Frontend',
        progress: 75
      })
    });
    const createdSkillData = await createSkillRes.json();
    assert(createSkillRes.status === 201, 'POST /api/skills returned 201 Created');
    assert(createdSkillData.success === true && createdSkillData.data.name === 'TypeScript', 'Skill was created with correct name');
    assert(createdSkillData.data.progress === 75, 'Skill was created with correct progress');
    const newSkillId = createdSkillData.data.id;

    // 2. Skills: PUT
    const updateSkillRes = await fetch(`${BASE_URL}/api/skills/${newSkillId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        progress: 90
      })
    });
    const updatedSkillData = await updateSkillRes.json();
    assert(updateSkillRes.status === 200, 'PUT /api/skills/:id returned 200 OK');
    assert(updatedSkillData.data.progress === 90, 'Skill progress was updated to 90');

    // 2. Skills: DELETE
    const deleteSkillRes = await fetch(`${BASE_URL}/api/skills/${newSkillId}`, {
      method: 'DELETE'
    });
    const deletedSkillData = await deleteSkillRes.json();
    assert(deleteSkillRes.status === 200, 'DELETE /api/skills/:id returned 200 OK');
    assert(deletedSkillData.success === true && deletedSkillData.data.id === newSkillId, 'Skill was deleted successfully');

    // 2. Skills: 404 test
    const notFoundSkillRes = await fetch(`${BASE_URL}/api/skills/non-existent-id`, {
      method: 'DELETE'
    });
    assert(notFoundSkillRes.status === 404, 'DELETE /api/skills/invalid-id returned 404 Not Found');

    // 3. Projects: GET
    const projRes = await fetch(`${BASE_URL}/api/projects`);
    const projData = await projRes.json();
    assert(projRes.status === 200, 'GET /api/projects returned 200 OK');
    assert(projData.success === true && Array.isArray(projData.data), 'Projects data is an array');

    // 3. Projects: POST
    const createProjRes = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Portfolio Website',
        description: 'Modern developer portfolio with dark mode and analytics',
        technologies: ['React', 'Tailwind CSS', 'Vite'],
        githubUrl: 'https://github.com/alexrivera/portfolio',
        liveUrl: 'https://portfolio.dev',
        status: 'In Progress',
        progress: 80
      })
    });
    const createdProjData = await createProjRes.json();
    assert(createProjRes.status === 201, 'POST /api/projects returned 201 Created');
    assert(createdProjData.data.name === 'Portfolio Website', 'Project created with correct name');
    const newProjId = createdProjData.data.id;

    // 3. Projects: PUT
    const updateProjRes = await fetch(`${BASE_URL}/api/projects/${newProjId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'Completed',
        progress: 100
      })
    });
    const updatedProjData = await updateProjRes.json();
    assert(updateProjRes.status === 200, 'PUT /api/projects/:id returned 200 OK');
    assert(updatedProjData.data.status === 'Completed' && updatedProjData.data.progress === 100, 'Project updated to Completed 100%');

    // 3. Projects: DELETE
    const deleteProjRes = await fetch(`${BASE_URL}/api/projects/${newProjId}`, {
      method: 'DELETE'
    });
    assert(deleteProjRes.status === 200, 'DELETE /api/projects/:id returned 200 OK');

    // 4. Goals: GET
    const goalsRes = await fetch(`${BASE_URL}/api/goals`);
    const goalsData = await goalsRes.json();
    assert(goalsRes.status === 200, 'GET /api/goals returned 200 OK');
    assert(goalsData.success === true && Array.isArray(goalsData.data), 'Goals data is an array');

    // 4. Goals: POST
    const createGoalRes = await fetch(`${BASE_URL}/api/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Master Node.js Streams',
        description: 'Deep dive into stream pipelines and backpressure',
        deadline: 'Sunday',
        category: 'Learning',
        priority: 'High',
        completed: false
      })
    });
    const createdGoalData = await createGoalRes.json();
    assert(createGoalRes.status === 201, 'POST /api/goals returned 201 Created');
    assert(createdGoalData.data.title === 'Master Node.js Streams', 'Goal created with correct title');
    const newGoalId = createdGoalData.data.id;

    // 4. Goals: PUT
    const updateGoalRes = await fetch(`${BASE_URL}/api/goals/${newGoalId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        completed: true
      })
    });
    const updatedGoalData = await updateGoalRes.json();
    assert(updateGoalRes.status === 200, 'PUT /api/goals/:id returned 200 OK');
    assert(updatedGoalData.data.completed === true, 'Goal marked as completed');

    // 4. Goals: DELETE
    const deleteGoalRes = await fetch(`${BASE_URL}/api/goals/${newGoalId}`, {
      method: 'DELETE'
    });
    assert(deleteGoalRes.status === 200, 'DELETE /api/goals/:id returned 200 OK');

    // 5. DSA: GET
    const dsaRes = await fetch(`${BASE_URL}/api/dsa`);
    const dsaData = await dsaRes.json();
    assert(dsaRes.status === 200, 'GET /api/dsa returned 200 OK');
    assert(dsaData.success === true && Array.isArray(dsaData.data), 'DSA data is an array');
    const topicNames = dsaData.data.map(t => t.topic);
    const expectedTopics = [
      'Arrays', 'Strings', 'Linked List', 'Stack',
      'Queue', 'Trees', 'Graphs', 'Dynamic Programming'
    ];
    const hasAllTopics = expectedTopics.every(t => topicNames.includes(t));
    assert(hasAllTopics, 'All 8 required DSA topics are present');

    // 5. DSA: PUT (by ID or topic name)
    const updateDsaRes = await fetch(`${BASE_URL}/api/dsa/dsa-1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        solved: 20
      })
    });
    const updatedDsaData = await updateDsaRes.json();
    assert(updateDsaRes.status === 200, 'PUT /api/dsa/:id returned 200 OK');
    assert(updatedDsaData.data.solved === 20, 'DSA topic solved count updated to 20');
    assert(updatedDsaData.data.progress === Math.round((20 / updatedDsaData.data.total) * 100), 'DSA progress automatically recalculated');

    // 6. 404 Handler for Unknown Route
    const unknownRes = await fetch(`${BASE_URL}/api/non-existent-route`);
    const unknownData = await unknownRes.json();
    assert(unknownRes.status === 404, 'Unknown API route returns 404');
    assert(unknownData.success === false, '404 handler returns success: false');

    console.log(`\n--- Test Suite Completed: ${passed} Passed, ${failed} Failed ---`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
}

runTests();
