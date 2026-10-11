import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:5000/api';

async function runDay9AiTestSuite() {
  console.log('================================================================');
  console.log('      CareerOS Day 9: Helping AI Learning Assistant Test Suite  ');
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
    const userAEmail = `learner.ai.a.${timestamp}@careeros.test`;
    const userBEmail = `learner.ai.b.${timestamp}@careeros.test`;
    const commonPassword = 'SecurePassword123!';

    // Step 1: Health check
    console.log('[Step 1] Verifying System Health Check...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.success, 'GET /api/health returned 200 OK');

    // Step 2: Unauthenticated Guards
    console.log('\n[Step 2] Verifying 401 Unauthorized Guards...');
    const unauthChatRes = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello AI' })
    });
    assert(unauthChatRes.status === 401, 'POST /api/ai/chat without token returns 401 Unauthorized');

    const unauthConvsRes = await fetch(`${BASE_URL}/ai/conversations`);
    assert(unauthConvsRes.status === 401, 'GET /api/ai/conversations without token returns 401 Unauthorized');

    const unauthContextRes = await fetch(`${BASE_URL}/ai/context`);
    assert(unauthContextRes.status === 401, 'GET /api/ai/context without token returns 401 Unauthorized');

    // Step 3: Authenticate Users
    console.log('\n[Step 3] Registering Test Users A and B...');
    const userARes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alex Learner', email: userAEmail, password: commonPassword })
    });
    const userAData = await userARes.json();
    assert(userARes.status === 201 && userAData.token, 'User A registered with valid JWT');
    const tokenA = userAData.token;

    const userBRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Sam Rival', email: userBEmail, password: commonPassword })
    });
    const userBData = await userBRes.json();
    assert(userBRes.status === 201 && userBData.token, 'User B registered with valid JWT');
    const tokenB = userBData.token;

    // Step 4: Context Builder Verification
    console.log('\n[Step 4] Verifying Context Builder API (/api/ai/context)...');
    const contextRes = await fetch(`${BASE_URL}/ai/context?careerSlug=full-stack-developer&moduleSlug=javascript-core`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const contextData = await contextRes.json();
    assert(contextRes.status === 200 && contextData.success, 'GET /api/ai/context returned 200 OK');
    assert(contextData.context?.student?.name === 'Alex Learner', 'Context contains correct student name');
    assert(contextData.context?.career?.slug === 'full-stack-developer', 'Context contains enrolled career');
    assert(contextData.context?.module?.slug === 'javascript-core', 'Context contains active module');
    assert(typeof contextData.context?.progress?.overallPercentage === 'number', 'Context contains progress percentage');
    assert(Array.isArray(contextData.context?.skills), 'Context contains student skills list');
    assert(contextData.context?.dsa && typeof contextData.context?.dsa?.totalSolved === 'number', 'Context contains DSA metrics');
    assert(contextData.context?.weakAreas && Array.isArray(contextData.context?.weakAreas?.skills), 'Context identifies weak areas');

    // Step 5: Input Validation Tests
    console.log('\n[Step 5] Testing AI Chat Input Validations...');
    const emptyMsgRes = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ message: '   ' })
    });
    assert(emptyMsgRes.status === 400, 'POST /api/ai/chat with empty whitespace message returns 400 Bad Request');

    // Step 6: AI Chat Topic Explanation (Mock Engine)
    console.log('\n[Step 6] Testing AI Topic Explanation (Closures)...');
    const chatRes1 = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        message: 'Explain closures in JavaScript simply',
        careerSlug: 'full-stack-developer',
        moduleSlug: 'javascript-core'
      })
    });
    const chatData1 = await chatRes1.json();
    assert(chatRes1.status === 200 && chatData1.success, 'POST /api/ai/chat returned 200 OK');
    assert(chatData1.conversationId, `Created conversation with ID: ${chatData1.conversationId}`);
    assert(chatData1.latestReply.includes('Understanding JavaScript Closures'), 'Reply contains closure explanation');
    assert(chatData1.latestReply.includes('```javascript'), 'Reply contains code block with syntax');
    assert(chatData1.provider === 'mock', 'Provider is identified as mock');
    assert(chatData1.messages.length === 2, 'Conversation contains exactly 2 messages (1 user, 1 assistant)');
    const savedConvId = chatData1.conversationId;

    // Step 7: Multi-turn Conversation Continuity
    console.log('\n[Step 7] Testing Multi-turn Conversation Memory...');
    const chatRes2 = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        conversationId: savedConvId,
        message: 'Can you show me the event loop in comparison?',
        careerSlug: 'full-stack-developer',
        moduleSlug: 'javascript-core'
      })
    });
    const chatData2 = await chatRes2.json();
    assert(chatRes2.status === 200 && chatData2.success, 'Multi-turn chat call returned 200 OK');
    assert(chatData2.conversationId === savedConvId, 'Conversation ID persisted across turns');
    assert(chatData2.messages.length === 4, 'Conversation now contains 4 messages in history');
    assert(chatData2.latestReply.includes('Event Loop'), 'Assistant provided event loop response');

    // Step 8: Quick Action Shortcut Prompts
    console.log('\n[Step 8] Testing Predefined Quick Action Shortcuts...');
    
    // Quick Action: Practice Questions
    const practiceRes = await fetch(`${BASE_URL}/ai/quick-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        action: 'practice',
        careerSlug: 'full-stack-developer',
        moduleSlug: 'javascript-core'
      })
    });
    const practiceData = await practiceRes.json();
    assert(practiceRes.status === 200 && practiceData.success, 'POST /api/ai/quick-action (practice) returned 200 OK');
    assert(practiceData.latestReply.includes('Practice Challenge Set'), 'Reply generated practice questions');
    assert(practiceData.latestReply.includes('5.'), 'Reply contains 5 practice problems');

    // Quick Action: 2-Hour Study Plan
    const studyPlanRes = await fetch(`${BASE_URL}/ai/quick-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        action: 'study-plan',
        careerSlug: 'full-stack-developer',
        moduleSlug: 'javascript-core'
      })
    });
    const studyPlanData = await studyPlanRes.json();
    assert(studyPlanRes.status === 200 && studyPlanData.success, 'POST /api/ai/quick-action (study-plan) returned 200 OK');
    assert(studyPlanData.latestReply.includes('2-Hour Study Plan'), 'Reply generated structured study plan');

    // Quick Action: Weak Area Diagnostics
    const weakAreasRes = await fetch(`${BASE_URL}/ai/quick-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        action: 'weak-areas',
        careerSlug: 'full-stack-developer',
        moduleSlug: 'javascript-core'
      })
    });
    const weakAreasData = await weakAreasRes.json();
    assert(weakAreasRes.status === 200 && weakAreasData.success, 'POST /api/ai/quick-action (weak-areas) returned 200 OK');
    assert(weakAreasData.latestReply.includes('Learning Diagnostics'), 'Reply generated learning diagnosis');

    // Step 9: User Conversation Retrieval & Pagination
    console.log('\n[Step 9] Verifying Conversation List and Retrieval...');
    const listRes = await fetch(`${BASE_URL}/ai/conversations`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const listData = await listRes.json();
    assert(listRes.status === 200 && listData.success, 'GET /api/ai/conversations returned 200 OK');
    assert(Array.isArray(listData.conversations) && listData.conversations.length >= 2, `Retrieved ${listData.conversations.length} conversations for User A`);

    const singleConvRes = await fetch(`${BASE_URL}/ai/conversations/${savedConvId}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const singleConvData = await singleConvRes.json();
    assert(singleConvRes.status === 200 && singleConvData.success, 'GET /api/ai/conversations/:id returned 200 OK');
    assert(singleConvData.conversation?.conversationId === savedConvId, 'Retrieved matching conversation document');
    assert(singleConvData.conversation?.messages?.length === 4, 'Retrieved all 4 messages intact');

    // Step 10: User Isolation Verification (Security Guard)
    console.log('\n[Step 10] Verifying Strict Multi-Tenant User Isolation...');
    
    // User B should NOT see User A's conversations in their list
    const userBListRes = await fetch(`${BASE_URL}/ai/conversations`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const userBListData = await userBListRes.json();
    assert(userBListRes.status === 200, 'User B can fetch their own conversation list');
    const userBHasUserAConv = userBListData.conversations?.some(c => c.conversationId === savedConvId);
    assert(!userBHasUserAConv, 'User B does NOT see User A’s conversations in list');

    // User B attempting to read User A's conversation directly by ID must fail with 404
    const userBAccessUserAConv = await fetch(`${BASE_URL}/ai/conversations/${savedConvId}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(userBAccessUserAConv.status === 404, 'User B cannot access User A’s conversation ID (returns 404)');

    // User B attempting to delete User A's conversation must fail with 404
    const userBDeleteUserAConv = await fetch(`${BASE_URL}/ai/conversations/${savedConvId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(userBDeleteUserAConv.status === 404, 'User B cannot delete User A’s conversation ID (returns 404)');

    // Step 11: Conversation Deletion by Owner
    console.log('\n[Step 11] Testing Owner Conversation Deletion...');
    const deleteRes = await fetch(`${BASE_URL}/ai/conversations/${savedConvId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const deleteData = await deleteRes.json();
    assert(deleteRes.status === 200 && deleteData.success, 'Owner User A successfully deleted their conversation');

    // Confirm deletion
    const verifyDeleteRes = await fetch(`${BASE_URL}/ai/conversations/${savedConvId}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(verifyDeleteRes.status === 404, 'Subsequent fetch of deleted conversation returns 404 Not Found');

    console.log('\n================================================================');
    console.log(`  DAY 9 TEST RESULTS: All ${passed} checks PASSED! (${failed} failed)`);
    console.log('================================================================\n');

  } catch (error) {
    console.error('\n[FATAL DAY 9 TEST FAILURE]:', error.message);
    process.exit(1);
  }
}

runDay9AiTestSuite();
