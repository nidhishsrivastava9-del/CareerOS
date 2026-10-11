import dotenv from 'dotenv';
import { 
  extractVideoId, 
  normalizeResourceData 
} from './services/contentService.js';
import {
  extractYouTubeVideoId,
  isValidYouTubeId,
  getYouTubeEmbedUrl,
  getYouTubeWatchUrl,
  getYouTubeThumbnail,
  resolveVideoResource
} from '../src/utils/videoUtils.js';

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:5000/api';

async function runVideoSystemTests() {
  console.log('================================================================');
  console.log('  CareerOS Video System & URL Normalization Test Suite         ');
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
    const REAL_VIDEO_ID = '8aGhZQkoFbQ'; // Philip Roberts Event Loop JSConf

    // -------------------------------------------------------------------------
    // Test Case 1: YouTube Watch URL
    // -------------------------------------------------------------------------
    console.log('[Test Case 1] YouTube Watch URL Handling...');
    const watchUrl = `https://www.youtube.com/watch?v=${REAL_VIDEO_ID}&t=120s`;
    const idFromWatch = extractYouTubeVideoId(watchUrl);
    assert(idFromWatch === REAL_VIDEO_ID, `Extracted ID "${idFromWatch}" from full watch URL`);

    const backendIdFromWatch = extractVideoId(watchUrl);
    assert(backendIdFromWatch === REAL_VIDEO_ID, `Backend extracted ID "${backendIdFromWatch}" from watch URL`);

    const embedFromWatch = getYouTubeEmbedUrl(watchUrl);
    assert(
      embedFromWatch.includes(`https://www.youtube-nocookie.com/embed/${REAL_VIDEO_ID}`),
      `Derived privacy embed URL from watch URL: ${embedFromWatch}`
    );

    // -------------------------------------------------------------------------
    // Test Case 2: YouTube Short URL (youtu.be)
    // -------------------------------------------------------------------------
    console.log('\n[Test Case 2] YouTube Short URL (youtu.be) Handling...');
    const shortUrl = `https://youtu.be/${REAL_VIDEO_ID}?si=abcd1234efgh`;
    const idFromShort = extractYouTubeVideoId(shortUrl);
    assert(idFromShort === REAL_VIDEO_ID, `Extracted ID "${idFromShort}" from youtu.be link`);

    const backendIdFromShort = extractVideoId(shortUrl);
    assert(backendIdFromShort === REAL_VIDEO_ID, `Backend extracted ID "${backendIdFromShort}" from youtu.be link`);

    // -------------------------------------------------------------------------
    // Test Case 3: YouTube Embed URL
    // -------------------------------------------------------------------------
    console.log('\n[Test Case 3] YouTube Embed URL Handling...');
    const embedInput = `https://www.youtube.com/embed/${REAL_VIDEO_ID}`;
    const idFromEmbed = extractYouTubeVideoId(embedInput);
    assert(idFromEmbed === REAL_VIDEO_ID, `Extracted ID "${idFromEmbed}" from existing embed URL`);

    const nocookieInput = `https://www.youtube-nocookie.com/embed/${REAL_VIDEO_ID}`;
    const idFromNocookie = extractYouTubeVideoId(nocookieInput);
    assert(idFromNocookie === REAL_VIDEO_ID, `Extracted ID "${idFromNocookie}" from youtube-nocookie embed URL`);

    // -------------------------------------------------------------------------
    // Test Case 4: Invalid URL
    // -------------------------------------------------------------------------
    console.log('\n[Test Case 4] Invalid URL Handling...');
    const invalidUrl = 'https://random-blog.com/posts/not-a-video';
    const idFromInvalid = extractYouTubeVideoId(invalidUrl);
    assert(idFromInvalid === null, `Invalid URL returned null (got: ${idFromInvalid})`);

    const embedFromInvalid = getYouTubeEmbedUrl(invalidUrl);
    assert(embedFromInvalid === null, `Invalid URL produced null embed URL (no broken iframe)`);

    const resolvedInvalid = resolveVideoResource({
      type: 'video',
      title: 'Invalid Lecture',
      sourceUrl: invalidUrl
    });
    assert(resolvedInvalid.isValid === false, 'Invalid resource marked isValid=false');
    assert(resolvedInvalid.embedUrl === null, 'Invalid resource has embedUrl=null');
    assert(resolvedInvalid.watchUrl === invalidUrl, 'Invalid resource preserves original link as external fallback');

    // -------------------------------------------------------------------------
    // Test Case 5: Missing videoId
    // -------------------------------------------------------------------------
    console.log('\n[Test Case 5] Missing videoId Handling...');
    const resolvedMissing = resolveVideoResource({
      type: 'video',
      title: 'Missing Video Lecture'
    });
    assert(resolvedMissing.isValid === false, 'Missing video ID resource marked isValid=false');
    assert(resolvedMissing.embedUrl === null, 'Missing video ID has embedUrl=null');
    assert(resolvedMissing.videoId === null, 'Missing video ID has videoId=null');

    // -------------------------------------------------------------------------
    // Test Case 6: Non-Embeddable / Non-Standard Video & Fallback Model
    // -------------------------------------------------------------------------
    console.log('\n[Test Case 6] Non-Embeddable Fallback Model...');
    const nonEmbeddableResource = {
      type: 'video',
      title: 'Private Lecture Link',
      sourceUrl: 'https://vimeo.com/987654321',
      platform: 'vimeo'
    };
    const resolvedNonEmbed = resolveVideoResource(nonEmbeddableResource);
    assert(resolvedNonEmbed.isValid === false, 'Non-YouTube/non-embeddable resource correctly flagged');
    assert(resolvedNonEmbed.embedUrl === null, 'Non-embeddable resource returns null embedUrl');
    assert(resolvedNonEmbed.watchUrl === 'https://vimeo.com/987654321', 'Fallback watchUrl preserved for direct external navigation');

    // -------------------------------------------------------------------------
    // Test Case 7: Direct 11-char ID & ID Validator
    // -------------------------------------------------------------------------
    console.log('\n[Test Case 7] Direct 11-char ID & Validation...');
    assert(isValidYouTubeId(REAL_VIDEO_ID) === true, `"${REAL_VIDEO_ID}" is a valid 11-char ID`);
    assert(isValidYouTubeId('too_short') === false, '"too_short" rejected by ID validator');
    assert(isValidYouTubeId('too_long_video_identifier_1234') === false, 'Long fake ID rejected by validator');
    assert(isValidYouTubeId('') === false, 'Empty string rejected by validator');
    assert(isValidYouTubeId(null) === false, 'null rejected by validator');

    // -------------------------------------------------------------------------
    // Test Case 8: Thumbnail Generator
    // -------------------------------------------------------------------------
    console.log('\n[Test Case 8] Thumbnail Generator...');
    const thumbnail = getYouTubeThumbnail(REAL_VIDEO_ID, 'hqdefault');
    assert(
      thumbnail === `https://img.youtube.com/vi/${REAL_VIDEO_ID}/hqdefault.jpg`,
      `Thumbnail URL generated: ${thumbnail}`
    );

    // -------------------------------------------------------------------------
    // Test Case 9: Backend Normalization (Watch URL in POST)
    // -------------------------------------------------------------------------
    console.log('\n[Test Case 9] Backend normalizeResourceData with Watch URL...');
    const normalizedData = normalizeResourceData({
      title: 'Event Loop Deep Dive',
      type: 'video',
      sourceUrl: `https://www.youtube.com/watch?v=${REAL_VIDEO_ID}`,
      embedUrl: `https://www.youtube.com/watch?v=${REAL_VIDEO_ID}` // watch URL passed accidentally as embedUrl
    });
    assert(normalizedData.videoId === REAL_VIDEO_ID, `Backend normalized videoId to "${normalizedData.videoId}"`);
    assert(
      normalizedData.embedUrl === `https://www.youtube-nocookie.com/embed/${REAL_VIDEO_ID}`,
      `Backend corrected watch URL to canonical embedUrl: ${normalizedData.embedUrl}`
    );

    // -------------------------------------------------------------------------
    // Test Case 10: Real API Endpoint Verification
    // -------------------------------------------------------------------------
    console.log('\n[Test Case 10] Live API Resource Endpoint Verification...');
    const apiRes = await fetch(`${BASE_URL}/resources?career=full-stack-developer&module=javascript-core&status=published`);
    const apiData = await apiRes.json();
    assert(apiRes.status === 200 && apiData.success, 'GET /api/resources returned 200 OK');

    const videos = (apiData.resources || []).filter(r => r.type === 'video');
    assert(videos.length >= 2, `Found ${videos.length} videos in published catalog`);

    for (const vid of videos) {
      assert(isValidYouTubeId(vid.videoId), `Video "${vid.title}" has valid 11-char ID: ${vid.videoId}`);
      assert(
        vid.embedUrl.startsWith('https://www.youtube-nocookie.com/embed/'),
        `Video "${vid.title}" uses privacy-enhanced embedUrl: ${vid.embedUrl}`
      );
      assert(
        !vid.embedUrl.includes('watch?v='),
        `Video "${vid.title}" does NOT contain watch?v= in embedUrl`
      );
    }

    console.log('\n================================================================');
    console.log(`[VIDEO SYSTEM RESULT]: ALL ${passed} VIDEO TESTS PASSED! (${failed} failed)`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n[VIDEO SYSTEM FAILURE]:', err.message);
  } finally {
    process.exit(failed > 0 ? 1 : 0);
  }
}

runVideoSystemTests();
