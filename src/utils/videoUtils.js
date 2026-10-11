/**
 * CareerOS — Video Resource & Embed Utility
 * 
 * Robust video normalization, validation, and embed URL generator supporting:
 * - YouTube watch URLs (https://www.youtube.com/watch?v=VIDEO_ID)
 * - YouTube short URLs (https://youtu.be/VIDEO_ID)
 * - YouTube embed URLs (https://www.youtube.com/embed/VIDEO_ID)
 * - Privacy-enhanced embeds (https://www.youtube-nocookie.com/embed/VIDEO_ID)
 * - YouTube Shorts & Live URLs
 * - Direct 11-character video IDs
 * 
 * Provides graceful fallbacks and validation so no broken iframes are ever rendered.
 */

// Canonical YouTube video ID regex: strictly 11 characters
const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Validates whether a string is a valid 11-character YouTube video ID
 * @param {string} id
 * @returns {boolean}
 */
export function isValidYouTubeId(id) {
  if (!id || typeof id !== 'string') return false;
  return YOUTUBE_ID_REGEX.test(id.trim());
}

/**
 * Extracts canonical 11-character YouTube video ID from various URL patterns
 * @param {string} input - URL or raw ID
 * @returns {string|null} - 11-char video ID or null if invalid
 */
export function extractYouTubeVideoId(input) {
  if (!input || typeof input !== 'string') return null;
  const str = input.trim();

  // 1. Direct clean 11-character ID
  if (YOUTUBE_ID_REGEX.test(str)) {
    return str;
  }

  // 2. Short link: youtu.be/<id>
  const shortMatch = str.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (shortMatch && YOUTUBE_ID_REGEX.test(shortMatch[1])) {
    return shortMatch[1];
  }

  // 3. Watch URL: youtube.com/watch?v=<id>
  const watchMatch = str.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (watchMatch && YOUTUBE_ID_REGEX.test(watchMatch[1])) {
    return watchMatch[1];
  }

  // 4. Embed / v / shorts / live URL: youtube.com/(embed|v|shorts|live)/<id>
  const pathMatch = str.match(/youtube(?:-nocookie)?\.com\/(?:embed|v|shorts|live)\/([a-zA-Z0-9_-]{11})/i);
  if (pathMatch && YOUTUBE_ID_REGEX.test(pathMatch[1])) {
    return pathMatch[1];
  }

  return null;
}

/**
 * Generates a safe, privacy-enhanced YouTube embed URL
 * @param {string} input - Video ID or any supported YouTube URL
 * @param {object} options - Optional query parameters
 * @returns {string|null} - Embed URL or null if video ID is invalid
 */
export function getYouTubeEmbedUrl(input, options = {}) {
  const videoId = extractYouTubeVideoId(input);
  if (!videoId) return null;

  const { autoplay = false, rel = 0, modestbranding = 1 } = options;
  const params = new URLSearchParams();

  if (autoplay) params.set('autoplay', '1');
  if (rel === 0) params.set('rel', '0');
  if (modestbranding) params.set('modestbranding', '1');
  params.set('enablejsapi', '1');

  const query = params.toString();
  return `https://www.youtube-nocookie.com/embed/${videoId}${query ? `?${query}` : ''}`;
}

/**
 * Generates canonical external watch URL for opening directly on YouTube
 * @param {string} input - Video ID or URL
 * @returns {string|null}
 */
export function getYouTubeWatchUrl(input) {
  const videoId = extractYouTubeVideoId(input);
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
}

/**
 * Generates canonical YouTube video thumbnail URL
 * @param {string} input - Video ID or URL
 * @param {'hqdefault'|'maxresdefault'|'mqdefault'|'default'} quality
 * @returns {string}
 */
export function getYouTubeThumbnail(input, quality = 'hqdefault') {
  const videoId = extractYouTubeVideoId(input);
  return videoId ? `https://img.youtube.com/vi/${videoId}/${quality}.jpg` : '';
}

/**
 * Resolves all video properties from a resource object into a normalized, validated model
 * @param {object} resource - Resource object from API or seed data
 * @returns {object} Normalized video model with embeddability flags
 */
export function resolveVideoResource(resource = {}) {
  if (!resource) {
    return {
      isValid: false,
      videoId: null,
      embedUrl: null,
      watchUrl: null,
      thumbnailUrl: '',
      channel: 'Educational Partner',
      duration: '15 mins',
      platform: 'youtube'
    };
  }

  const vidMeta = resource.videoMetadata || {};

  // Extract candidate ID from any available field in priority order
  const rawCandidate =
    vidMeta.videoId ||
    resource.videoId ||
    resource.embedUrl ||
    resource.sourceUrl ||
    resource.url ||
    '';

  const cleanVideoId = extractYouTubeVideoId(rawCandidate);
  const isValid = Boolean(cleanVideoId);

  // Derive embed URL
  let embedUrl = null;
  if (isValid) {
    embedUrl = getYouTubeEmbedUrl(cleanVideoId, { autoplay: false });
  }

  // Derive canonical watch URL
  const watchUrl = isValid
    ? getYouTubeWatchUrl(cleanVideoId)
    : (resource.sourceUrl || resource.url || null);

  // Derive thumbnail
  const thumbnailUrl =
    (isValid ? getYouTubeThumbnail(cleanVideoId, 'hqdefault') : '') ||
    resource.thumbnail ||
    vidMeta.thumbnail ||
    '';

  const channel =
    resource.channel ||
    vidMeta.channel ||
    resource.provider ||
    resource.source ||
    'CareerOS Educational Partner';

  const duration =
    resource.duration ||
    vidMeta.duration ||
    (resource.durationMinutes ? `${resource.durationMinutes} mins` : '15 mins');

  const platform = resource.platform || vidMeta.platform || 'youtube';

  return {
    isValid,
    videoId: cleanVideoId,
    embedUrl,
    watchUrl,
    thumbnailUrl,
    channel,
    duration,
    platform
  };
}

export default {
  isValidYouTubeId,
  extractYouTubeVideoId,
  getYouTubeEmbedUrl,
  getYouTubeWatchUrl,
  getYouTubeThumbnail,
  resolveVideoResource
};
