import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:5000/api';

async function runDay8TestSuite() {
  console.log('================================================================');
  console.log('  CareerOS Day 8: Content Engine & Resource System Test Suite  ');
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
    const adminEmail = `admin.content.${timestamp}@careeros.test`;
    const learnerAEmail = `learner.a.${timestamp}@careeros.test`;
    const learnerBEmail = `learner.b.${timestamp}@careeros.test`;
    const commonPassword = 'SecurePassword123!';

    // Step 1: Health check
    console.log('[Step 1] Verifying System Health Check...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.success, 'GET /api/health returned 200 OK');

    // Step 2: Authenticate Users
    console.log('\n[Step 2] Authenticating Admin & Learners...');
    const adminRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Content Admin', email: adminEmail, password: commonPassword, role: 'admin' })
    });
    const adminData = await adminRes.json();
    assert(adminRes.status === 201 && adminData.token, 'Content Admin registered with JWT');
    const adminToken = adminData.token;

    const learnerARes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Learner Alex', email: learnerAEmail, password: commonPassword })
    });
    const learnerAData = await learnerARes.json();
    assert(learnerARes.status === 201 && learnerAData.token, 'Learner Alex registered with JWT');
    const learnerAToken = learnerAData.token;

    const learnerBRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Learner Sam', email: learnerBEmail, password: commonPassword })
    });
    const learnerBData = await learnerBRes.json();
    assert(learnerBRes.status === 201 && learnerBData.token, 'Learner Sam registered with JWT');
    const learnerBToken = learnerBData.token;

    // Step 3: Seed Resources Verification
    console.log('\n[Step 3] Verifying Seeded Learning Resources (/api/resources)...');
    const seedRes = await fetch(`${BASE_URL}/resources?career=full-stack-developer&module=javascript-core`);
    const seedData = await seedRes.json();
    assert(seedRes.status === 200 && seedData.success, 'GET /api/resources returned 200 OK');
    assert(Array.isArray(seedData.resources) && seedData.resources.length >= 7, `Loaded ${seedData.resources?.length} resources for JavaScript Core`);

    // Verify all 8 resource types are supported
    const typesInSeed = new Set(seedData.resources.map(r => r.type));
    console.log('Detected resource types in seed:', Array.from(typesInSeed).join(', '));
    assert(typesInSeed.has('theory'), 'Resource type "theory" exists');
    assert(typesInSeed.has('video'), 'Resource type "video" exists');
    assert(typesInSeed.has('notes'), 'Resource type "notes" exists');
    assert(typesInSeed.has('quiz'), 'Resource type "quiz" exists');
    assert(typesInSeed.has('pyq'), 'Resource type "pyq" exists');
    assert(typesInSeed.has('practice'), 'Resource type "practice" exists');
    assert(typesInSeed.has('project'), 'Resource type "project" exists');

    // Step 4: Filtering & Search
    console.log('\n[Step 4] Testing Resource Filtering & Search...');
    // Filter by type
    const videoFilterRes = await fetch(`${BASE_URL}/resources?type=video&module=javascript-core`);
    const videoFilterData = await videoFilterRes.json();
    assert(videoFilterRes.status === 200, 'Filter by type=video returned 200');
    assert(videoFilterData.resources.every(r => r.type === 'video'), 'All returned resources have type=video');
    assert(videoFilterData.resources.length >= 2, 'Found 2+ video resources for JavaScript Core');

    // Filter by difficulty
    const diffFilterRes = await fetch(`${BASE_URL}/resources?difficulty=beginner`);
    const diffFilterData = await diffFilterRes.json();
    assert(diffFilterRes.status === 200, 'Filter by difficulty=beginner returned 200');
    assert(diffFilterData.resources.every(r => r.difficulty?.toLowerCase() === 'beginner'), 'All returned resources have difficulty=beginner');

    // Search query
    const searchRes = await fetch(`${BASE_URL}/resources?search=Event+Loop`);
    const searchData = await searchRes.json();
    assert(searchRes.status === 200, 'Search query returned 200');
    assert(searchData.resources.some(r => r.title.toLowerCase().includes('event loop') || r.description.toLowerCase().includes('event loop')), 'Search successfully matched Event Loop resource');

    // Single resource retrieval by ID
    const sampleResource = seedData.resources[0];
    const singleRes = await fetch(`${BASE_URL}/resources/${sampleResource._id || sampleResource.id}`);
    const singleData = await singleRes.json();
    assert(singleRes.status === 200 && singleData.success, 'GET /api/resources/:id returned 200 OK');
    assert(singleData.resource.title === sampleResource.title, 'Single resource title matches');

    // Step 5: Video Resource Experience & Metadata
    console.log('\n[Step 5] Verifying Video Resource Specifications...');
    const videoRes = seedData.resources.find(r => r.type === 'video');
    assert(videoRes.platform === 'youtube', 'Video platform is youtube');
    assert(!!videoRes.videoId, `Video ID present: ${videoRes.videoId}`);
    assert(videoRes.embedUrl.includes('youtube-nocookie.com/embed/'), `Embed URL uses privacy-enhanced youtube-nocookie.com: ${videoRes.embedUrl}`);
    assert(!!videoRes.provider, `Provider/channel present: ${videoRes.provider}`);
    assert(!!videoRes.duration, `Duration present: ${videoRes.duration}`);

    // Step 6: Create New Resource (Admin)
    console.log('\n[Step 6] Testing Resource Creation & Ingestion...');
    const newVideoPayload = {
      title: 'Mastering JavaScript Closures in 15 Minutes',
      slug: `js-closures-${timestamp}`,
      type: 'video',
      career: 'full-stack-developer',
      subject: 'Frontend Engineering',
      phase: 1,
      module: 'javascript-core',
      lessonTopic: 'Closures & Scope',
      platform: 'youtube',
      videoId: `closure_${timestamp}`,
      sourceUrl: `https://www.youtube.com/watch?v=closure_${timestamp}`,
      duration: '15:20',
      difficulty: 'intermediate',
      language: 'English',
      provider: 'CareerOS Academy',
      status: 'draft',
      description: 'In-depth explanation of lexical environment and closures in JavaScript.',
      tags: ['closures', 'scope', 'javascript']
    };

    const createRes = await fetch(`${BASE_URL}/resources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify(newVideoPayload)
    });
    const createData = await createRes.json();
    assert(createRes.status === 201 && createData.success, 'POST /api/resources created new draft resource');
    const createdId = createData.resource._id || createData.resource.id;
    assert(createData.resource.embedUrl.includes(`closure_${timestamp}`), 'Automatic privacy embed URL generated correctly');

    // Step 7: Duplicate Prevention
    console.log('\n[Step 7] Testing Duplicate Prevention...');
    // Duplicate video ID attempt
    const dupVideoRes = await fetch(`${BASE_URL}/resources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        ...newVideoPayload,
        slug: `different-slug-${timestamp}`,
        title: 'Duplicate Video Attempt'
      })
    });
    const dupVideoData = await dupVideoRes.json();
    assert(dupVideoRes.status === 409, 'Duplicate video (same platform + videoId) rejected with 409 Conflict');

    // Duplicate slug attempt
    const dupSlugRes = await fetch(`${BASE_URL}/resources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        ...newVideoPayload,
        videoId: `another_video_${timestamp}`,
        sourceUrl: `https://www.youtube.com/watch?v=another_video_${timestamp}`
      })
    });
    const dupSlugData = await dupSlugRes.json();
    assert(dupSlugRes.status === 409, 'Duplicate slug within same career/module rejected with 409 Conflict');

    // Step 8: Content Lifecycle & Moderation Workflow
    console.log('\n[Step 8] Testing Content Lifecycle Workflow (draft -> review -> approved -> published -> archived)...');
    
    // Normal learner should NOT see draft resource
    const learnerQueryDraft = await fetch(`${BASE_URL}/resources?module=javascript-core`, {
      headers: { Authorization: `Bearer ${learnerAToken}` }
    });
    const learnerDraftData = await learnerQueryDraft.json();
    const isDraftVisible = learnerDraftData.resources.some(r => (r._id || r.id) === createdId);
    assert(!isDraftVisible, 'Learner CANNOT see draft resource in catalog (Draft isolation verified)');

    // Update status to 'review'
    const reviewRes = await fetch(`${BASE_URL}/resources/${createdId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'review' })
    });
    assert(reviewRes.status === 200, 'Resource transitioned to "review" status');

    // Update status to 'approved'
    const approveRes = await fetch(`${BASE_URL}/resources/${createdId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'approved' })
    });
    assert(approveRes.status === 200, 'Resource transitioned to "approved" status');

    // Update status to 'published'
    const pubRes = await fetch(`${BASE_URL}/resources/${createdId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'published' })
    });
    const pubData = await pubRes.json();
    assert(pubRes.status === 200 && pubData.resource.status === 'published', 'Resource transitioned to "published" status');

    // Learner can now see the published resource
    const learnerQueryPub = await fetch(`${BASE_URL}/resources?module=javascript-core`, {
      headers: { Authorization: `Bearer ${learnerAToken}` }
    });
    const learnerPubData = await learnerQueryPub.json();
    const isPubVisible = learnerPubData.resources.some(r => (r._id || r.id) === createdId);
    assert(isPubVisible, 'Learner CAN see resource once published');

    // Invalidation check: invalid status rejected
    const invalidStatusRes = await fetch(`${BASE_URL}/resources/${createdId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'super_published' })
    });
    assert(invalidStatusRes.status === 400, 'Invalid status update rejected with 400 Bad Request');

    // Step 9: Automated Ingestion Pipeline Architecture
    console.log('\n[Step 9] Testing Ingestion Pipeline Interface (/api/resources/ingest)...');
    
    // Clean up any stale test resource with 8ARodQ4Wlf4 or WebSockets from a previous test run
    const existingStale = await fetch(`${BASE_URL}/resources?status=all`);
    const staleData = await existingStale.json();
    if (staleData.resources) {
      for (const match of staleData.resources.filter(r => r.videoId === '8ARodQ4Wlf4' || r.slug?.includes('websockets'))) {
        await fetch(`${BASE_URL}/resources/${match.id || match._id}?hard=true`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` }
        });
      }
    }

    const ingestPayload = {
      title: 'WebSockets & Real-Time Communication',
      sourceUrl: 'https://youtu.be/8ARodQ4Wlf4?t=10s',
      career: 'full-stack-developer',
      subject: 'Backend Engineering',
      phase: 2,
      module: 'nodejs-express',
      lessonTopic: 'Real-Time WebSockets',
      provider: 'TechStream',
      durationSeconds: 1250,
      difficulty: 'intermediate',
      tags: ['websockets', 'networking', 'realtime']
    };

    const ingestRes = await fetch(`${BASE_URL}/resources/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify(ingestPayload)
    });
    const ingestData = await ingestRes.json();
    assert(ingestRes.status === 201 && ingestData.success, 'POST /api/resources/ingest normalized and ingested candidate');
    assert(ingestData.resource.platform === 'youtube', 'Ingestion normalized platform to youtube');
    assert(ingestData.resource.videoId === '8ARodQ4Wlf4', 'Ingestion extracted correct YouTube video ID from youtu.be');
    assert(ingestData.resource.status === 'review', 'Ingestion correctly assigned status="review" for quality gate');
    assert(ingestData.resource.duration === '20:50', 'Ingestion converted durationSeconds to standard MM:SS string');

    // Clean up ingested candidate so subsequent runs stay pristine
    if (ingestData.resource?.id) {
      await fetch(`${BASE_URL}/resources/${ingestData.resource.id}?hard=true`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
    }

    // Step 10: User Progress Integration with Day 8 Resources
    console.log('\n[Step 10] Testing User Progress Integration with Learning Resources...');
    const progressCareer = 'full-stack-developer';
    
    // Toggle lesson completion for Learner A
    const lessonToggleRes = await fetch(`${BASE_URL}/progress/toggle-lesson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${learnerAToken}`
      },
      body: JSON.stringify({
        careerSlug: progressCareer,
        lessonId: createdId
      })
    });
    const lessonToggleData = await lessonToggleRes.json();
    assert(lessonToggleRes.status === 200 && lessonToggleData.success, 'Learner A toggled Day 8 resource completion');
    assert(lessonToggleData.progress.completedLessons.includes(createdId), 'Resource ID present in completedLessons list');

    // Submit quiz score for Learner A
    const quizResource = seedData.resources.find(r => r.type === 'quiz');
    const quizId = quizResource._id || quizResource.id;
    const quizSubmitRes = await fetch(`${BASE_URL}/progress/quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${learnerAToken}`
      },
      body: JSON.stringify({
        careerSlug: progressCareer,
        quizId: quizId,
        score: 3,
        totalQuestions: 3
      })
    });
    const quizSubmitData = await quizSubmitRes.json();
    assert(quizSubmitRes.status === 200 && quizSubmitData.success, 'Learner A recorded quiz completion with score');
    const recordedQuiz = quizSubmitData.progress.quizScores.find(q => q.quizId === quizId);
    assert(recordedQuiz && recordedQuiz.score === 3, 'Quiz score preserved accurately in user progress');

    // Step 11: Cross-User Progress Isolation (Learner B MUST NOT see Learner A's progress)
    console.log('\n[Step 11] Verifying User Isolation on Resource Progress...');
    const learnerBProgressRes = await fetch(`${BASE_URL}/progress/${progressCareer}`, {
      headers: { Authorization: `Bearer ${learnerBToken}` }
    });
    const learnerBProgressData = await learnerBProgressRes.json();
    assert(learnerBProgressRes.status === 200, 'GET /api/progress for Learner B returned 200');
    assert(!learnerBProgressData.progress.completedLessons.includes(createdId), 'Learner B has 0 completed lessons (Learner A progress ISOLATED)');
    assert(!learnerBProgressData.progress.quizScores.some(q => q.quizId === quizId), 'Learner B has 0 quiz records (Learner A quiz score ISOLATED)');

    // Step 12: Resource Deletion / Soft-Archive
    console.log('\n[Step 12] Testing Resource Deletion & Archiving...');
    const deleteRes = await fetch(`${BASE_URL}/resources/${createdId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const deleteData = await deleteRes.json();
    assert(deleteRes.status === 200 && deleteData.success, 'DELETE /api/resources/:id succeeded');

    // Verify Learner can no longer see archived/deleted resource
    const checkArchivedRes = await fetch(`${BASE_URL}/resources?module=javascript-core`, {
      headers: { Authorization: `Bearer ${learnerAToken}` }
    });
    const checkArchivedData = await checkArchivedRes.json();
    const isArchivedVisible = checkArchivedData.resources.some(r => (r._id || r.id) === createdId);
    assert(!isArchivedVisible, 'Learner CANNOT see deleted/archived resource');

    // Hard delete test resource to keep collection pristine
    await fetch(`${BASE_URL}/resources/${createdId}?hard=true`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('\n================================================================');
    console.log(`[DAY 8 TEST SUITE RESULT]: ALL ${passed} TESTS PASSED! (${failed} failed)`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n[DAY 8 TEST SUITE FAILURE]:', err.message);
  } finally {
    process.exit(failed > 0 ? 1 : 0);
  }
}

runDay8TestSuite();
