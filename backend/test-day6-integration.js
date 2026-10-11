import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runDay6IntegrationTests() {
  console.log('================================================================');
  console.log('   CareerOS Day 6: Full Database-backed Integration Test Suite  ');
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

  const timestamp = Date.now();
  const userAEmail = `alex.rivera.${timestamp}@example.com`;
  const userBEmail = `sam.chen.${timestamp}@example.com`;
  const commonPassword = 'SecurePassword123!';

  console.log('[Step 1] Registering User A (Alex Rivera)...');
  const regARes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Alex Rivera', email: userAEmail, password: commonPassword })
  });
  const regAData = await regARes.json();
  assert(regARes.status === 201 && regAData.success && regAData.token, 'User A registered with status 201 and valid token');
  const tokenA = regAData.token;
  const userAId = regAData.user.id || regAData.user._id;

  console.log('[Step 2] Registering User B (Sam Chen)...');
  const regBRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Sam Chen', email: userBEmail, password: commonPassword })
  });
  const regBData = await regBRes.json();
  assert(regBRes.status === 201 && regBData.success && regBData.token, 'User B registered with status 201 and valid token');
  const tokenB = regBData.token;
  const userBId = regBData.user.id || regBData.user._id;

  console.log('\n[Step 3] Verifying Unauthenticated Protection...');
  const unauthRes = await fetch(`${BASE_URL}/skills`);
  assert(unauthRes.status === 401, 'GET /api/skills without token rejected with 401 Unauthorized');

  const invalidTokenRes = await fetch(`${BASE_URL}/skills`, {
    headers: { Authorization: 'Bearer invalid.token.value' }
  });
  assert(invalidTokenRes.status === 401, 'GET /api/skills with invalid token rejected with 401 Unauthorized');

  console.log('\n[Step 4] User A creates database records (Skill, Project, Goal, DSA)...');
  // 1. Skill
  const createSkillRes = await fetch(`${BASE_URL}/skills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      name: 'Docker & Kubernetes',
      category: 'DevOps',
      level: 85,
      progress: 85,
      status: 'Proficient'
    })
  });
  const createSkillData = await createSkillRes.json();
  assert(createSkillRes.status === 201 && createSkillData.success, 'User A created skill in MongoDB');
  const skillAId = createSkillData.data.id || createSkillData.data._id;

  // 2. Project
  const createProjectRes = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      title: 'Cloud Microservices Gateway',
      name: 'Cloud Microservices Gateway',
      description: 'Distributed API gateway with JWT rate-limiting and reverse proxying.',
      technologies: ['Node.js', 'Express', 'Redis', 'Docker'],
      status: 'In Progress',
      progress: 70
    })
  });
  const createProjData = await createProjectRes.json();
  assert(createProjectRes.status === 201 && createProjData.success, 'User A created project in MongoDB');
  const projAId = createProjData.data.id || createProjData.data._id;

  // 3. Goal
  const createGoalRes = await fetch(`${BASE_URL}/goals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      title: 'Deploy CareerOS to Production Cloud',
      deadline: 'Today',
      category: 'DevOps',
      priority: 'High',
      completed: false
    })
  });
  const createGoalData = await createGoalRes.json();
  assert(createGoalRes.status === 201 && createGoalData.success, 'User A created goal in MongoDB');
  const goalAId = createGoalData.data.id || createGoalData.data._id;

  // 4. DSA topic update
  const dsaResA = await fetch(`${BASE_URL}/dsa`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const dsaDataA = await dsaResA.json();
  assert(dsaResA.status === 200 && Array.isArray(dsaDataA.data), 'User A fetched initialized DSA topics');
  const dpTopicA = dsaDataA.data.find(t => t.topic.toLowerCase().includes('dynamic programming'));
  assert(dpTopicA, 'Found Dynamic Programming topic for User A');

  const updateDsaResA = await fetch(`${BASE_URL}/dsa/${dpTopicA.id || dpTopicA._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      solved: 15,
      total: 25,
      easy: 5,
      medium: 8,
      hard: 2
    })
  });
  const updateDsaDataA = await updateDsaResA.json();
  assert(updateDsaResA.status === 200 && updateDsaDataA.data.solved === 15, 'User A updated DSA topic solved count to 15');

  console.log('\n[Step 5] Cross-User Data Isolation Verification (User B MUST NOT see User A data)...');
  const userBSkillsRes = await fetch(`${BASE_URL}/skills`, {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  const userBSkillsData = await userBSkillsRes.json();
  assert(userBSkillsData.data.length === 0, 'User B has 0 skills (NO LEAK of User A skill)');

  const userBProjectsRes = await fetch(`${BASE_URL}/projects`, {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  const userBProjectsData = await userBProjectsRes.json();
  assert(userBProjectsData.data.length === 0, 'User B has 0 projects (NO LEAK of User A project)');

  const userBGoalsRes = await fetch(`${BASE_URL}/goals`, {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  const userBGoalsData = await userBGoalsRes.json();
  assert(userBGoalsData.data.length === 0, 'User B has 0 goals (NO LEAK of User A goal)');

  const userBDsaRes = await fetch(`${BASE_URL}/dsa`, {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  const userBDsaData = await userBDsaRes.json();
  const dpTopicB = userBDsaData.data.find(t => t.topic.toLowerCase().includes('dynamic programming'));
  assert(dpTopicB.solved === 0, 'User B DSA DP solved count is 0 (NO LEAK of User A 15 solved problems)');

  console.log('\n[Step 6] Ownership & Permission Enforcement (User B CANNOT mutate User A data)...');
  // Attempt to edit User A's skill
  const unauthorizedSkillEdit = await fetch(`${BASE_URL}/skills/${skillAId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenB}`
    },
    body: JSON.stringify({ name: 'Hacked Skill', level: 99 })
  });
  assert(
    unauthorizedSkillEdit.status === 404 || unauthorizedSkillEdit.status === 403,
    `User B cannot update User A skill (returned status ${unauthorizedSkillEdit.status})`
  );

  // Attempt to delete User A's skill
  const unauthorizedSkillDel = await fetch(`${BASE_URL}/skills/${skillAId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  assert(
    unauthorizedSkillDel.status === 404 || unauthorizedSkillDel.status === 403,
    `User B cannot delete User A skill (returned status ${unauthorizedSkillDel.status})`
  );

  // Attempt to edit User A's project
  const unauthorizedProjEdit = await fetch(`${BASE_URL}/projects/${projAId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenB}`
    },
    body: JSON.stringify({ title: 'Hacked Project' })
  });
  assert(
    unauthorizedProjEdit.status === 404 || unauthorizedProjEdit.status === 403,
    `User B cannot update User A project (returned status ${unauthorizedProjEdit.status})`
  );

  // Attempt to delete User A's project
  const unauthorizedProjDel = await fetch(`${BASE_URL}/projects/${projAId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  assert(
    unauthorizedProjDel.status === 404 || unauthorizedProjDel.status === 403,
    `User B cannot delete User A project (returned status ${unauthorizedProjDel.status})`
  );

  // Attempt to edit User A's goal
  const unauthorizedGoalEdit = await fetch(`${BASE_URL}/goals/${goalAId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenB}`
    },
    body: JSON.stringify({ completed: true })
  });
  assert(
    unauthorizedGoalEdit.status === 404 || unauthorizedGoalEdit.status === 403,
    `User B cannot update User A goal (returned status ${unauthorizedGoalEdit.status})`
  );

  // Attempt to delete User A's goal
  const unauthorizedGoalDel = await fetch(`${BASE_URL}/goals/${goalAId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  assert(
    unauthorizedGoalDel.status === 404 || unauthorizedGoalDel.status === 403,
    `User B cannot delete User A goal (returned status ${unauthorizedGoalDel.status})`
  );

  console.log('\n[Step 7] Testing Database Seed Endpoint for User B...');
  const seedResB = await fetch(`${BASE_URL}/seed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenB}`
    },
    body: JSON.stringify({ overwrite: false })
  });
  const seedDataB = await seedResB.json();
  assert(seedResB.status === 201 && seedDataB.success, 'User B seeded sample starter data into MongoDB');
  assert(seedDataB.data.skills.length > 0, 'User B now has populated skills');
  assert(seedDataB.data.projects.length > 0, 'User B now has populated projects');
  assert(seedDataB.data.goals.length > 0, 'User B now has populated goals');

  // Verify User A data was unaffected by User B seed
  const userASkillsPostSeed = await fetch(`${BASE_URL}/skills`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const userASkillsDataPostSeed = await userASkillsPostSeed.json();
  assert(
    userASkillsDataPostSeed.data.length === 1 && userASkillsDataPostSeed.data[0].name === 'Docker & Kubernetes',
    'User A data remained completely intact after User B seeded data'
  );

  console.log('\n[Step 8] User A updates and deletes own records (Full CRUD)...');
  // Update goal
  const updateGoalResA = await fetch(`${BASE_URL}/goals/${goalAId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`
    },
    body: JSON.stringify({ completed: true, status: 'Completed' })
  });
  const updateGoalDataA = await updateGoalResA.json();
  assert(updateGoalResA.status === 200 && updateGoalDataA.data.completed === true, 'User A updated own goal to completed');

  // Delete project
  const delProjResA = await fetch(`${BASE_URL}/projects/${projAId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const delProjDataA = await delProjResA.json();
  assert(delProjResA.status === 200 && delProjDataA.success, 'User A successfully deleted own project');

  const checkProjectsA = await fetch(`${BASE_URL}/projects`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const checkProjDataA = await checkProjectsA.json();
  assert(checkProjDataA.data.length === 0, 'User A now has 0 projects after deletion');

  console.log('\n================================================================');
  console.log(`  ALL DAY 6 INTEGRATION TESTS PASSED! (${passed} checks passed)  `);
  console.log('================================================================\n');
}

runDay6IntegrationTests().catch((err) => {
  console.error('\n❌ Test failure:', err.message);
  process.exit(1);
});
