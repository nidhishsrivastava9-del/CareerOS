import Resource from '../models/Resource.js';
import { memoryResources } from '../data/store.js';
import mongoose from 'mongoose';

/**
 * CareerOS Content Engine Service (Day 8)
 * 
 * Centralized business logic for resource normalization, duplicate detection,
 * lifecycle workflows (draft -> review -> approved -> published -> archived),
 * and ingestion pipeline abstractions.
 */

// Permitted status transitions
export const STATUS_TRANSITIONS = {
  draft: ['review', 'archived'],
  review: ['approved', 'draft', 'archived'],
  approved: ['published', 'review', 'archived'],
  published: ['archived', 'review'],
  archived: ['draft']
};

/**
 * Normalizes YouTube URLs into canonical embed and watch URLs
 */
export function extractVideoId(urlOrId) {
  if (!urlOrId) return '';
  const trimmed = String(urlOrId).trim();
  // If already a clean 11-char video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  // Matches youtu.be/<id>
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (shortMatch) return shortMatch[1];

  // Matches youtube.com/watch?v=<id>
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (watchMatch) return watchMatch[1];

  // Matches youtube.com/(embed|v|shorts|live)/<id>
  const embedMatch = trimmed.match(/youtube(?:-nocookie)?\.com\/(?:embed|v|shorts|live)\/([a-zA-Z0-9_-]{11})/i);
  if (embedMatch) return embedMatch[1];

  return trimmed;
}

/**
 * Generates URL-friendly slug from title
 */
export function generateSlug(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parses duration string (e.g. "25 mins", "18:40") to integer minutes
 */
export function parseDurationMinutes(durationStr) {
  if (typeof durationStr === 'number') return durationStr;
  if (!durationStr) return 15;
  const str = String(durationStr).trim();
  
  if (str.includes(':')) {
    const parts = str.split(':').map(Number);
    if (parts.length === 2) return Math.round(parts[0] + parts[1] / 60);
    if (parts.length === 3) return Math.round(parts[0] * 60 + parts[1] + parts[2] / 60);
  }

  const numMatch = str.match(/\d+/);
  return numMatch ? parseInt(numMatch[0], 10) : 15;
}

/**
 * Check if video resource is duplicate
 */
export async function checkDuplicateVideo(platform, videoId, excludeId = null) {
  if (!platform || !videoId) return false;

  if (mongoose.connection.readyState === 1) {
    const query = {
      type: 'video',
      'videoMetadata.platform': platform,
      'videoMetadata.videoId': videoId
    };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const existing = await Resource.findOne(query);
    return Boolean(existing);
  }

  // In-memory fallback check
  const existing = (memoryResources || []).find(r => 
    r.type === 'video' &&
    r.videoMetadata?.platform === platform &&
    r.videoMetadata?.videoId === videoId &&
    (excludeId ? (r.id !== excludeId && r._id !== excludeId) : true)
  );
  return Boolean(existing);
}

/**
 * Check if resource slug already exists in career & module
 */
export async function checkDuplicateSlug(career, moduleSlug, slug, excludeId = null) {
  if (!career || !moduleSlug || !slug) return false;

  if (mongoose.connection.readyState === 1) {
    const query = { career: career.toLowerCase(), module: moduleSlug.toLowerCase(), slug: slug.toLowerCase() };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await Resource.findOne(query);
    return Boolean(existing);
  }

  const existing = (memoryResources || []).find(r => 
    r.career?.toLowerCase() === career.toLowerCase() &&
    r.module?.toLowerCase() === moduleSlug.toLowerCase() &&
    r.slug?.toLowerCase() === slug.toLowerCase() &&
    (excludeId ? (r.id !== excludeId && r._id !== excludeId) : true)
  );
  return Boolean(existing);
}

/**
 * Normalizes input resource data
 */
export function normalizeResourceData(data) {
  const normalized = { ...data };

  // Normalize slug
  if (!normalized.slug && normalized.title) {
    normalized.slug = generateSlug(normalized.title);
  } else if (normalized.slug) {
    normalized.slug = generateSlug(normalized.slug);
  }

  // Normalize or infer type
  if (!normalized.type) {
    if (
      normalized.videoId || 
      (normalized.sourceUrl && (normalized.sourceUrl.includes('youtube') || normalized.sourceUrl.includes('youtu.be') || normalized.sourceUrl.includes('vimeo')))
    ) {
      normalized.type = 'video';
    } else {
      normalized.type = 'theory';
    }
  } else {
    normalized.type = String(normalized.type).toLowerCase();
  }

  // Normalize career and module references
  if (normalized.career) normalized.career = normalized.career.toLowerCase().trim();
  if (normalized.module) normalized.module = normalized.module.toLowerCase().trim();

  // Normalize duration
  if (normalized.durationSeconds && !normalized.duration) {
    const totalSecs = Number(normalized.durationSeconds);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    normalized.duration = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    normalized.durationMinutes = Math.round(totalSecs / 60);
  } else if (normalized.duration && !normalized.durationMinutes) {
    normalized.durationMinutes = parseDurationMinutes(normalized.duration);
  } else if (normalized.durationMinutes && !normalized.duration) {
    normalized.duration = `${normalized.durationMinutes} mins`;
  }

  // Normalize difficulty
  if (normalized.difficulty) {
    const diffMap = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      'all levels': 'All Levels',
      all: 'All Levels'
    };
    const key = String(normalized.difficulty).toLowerCase().trim();
    normalized.difficulty = diffMap[key] || 'Beginner';
  }

  // Normalize video fields
  if (normalized.type === 'video') {
    normalized.videoMetadata = normalized.videoMetadata || {};
    const platform = normalized.platform || normalized.videoMetadata.platform || 'youtube';
    normalized.platform = platform;
    normalized.videoMetadata.platform = platform;

    // Extract videoId from URL or field
    const rawVideoId = normalized.videoId || normalized.videoMetadata.videoId || normalized.sourceUrl || '';
    const cleanVideoId = extractVideoId(rawVideoId);
    normalized.videoId = cleanVideoId;
    normalized.videoMetadata.videoId = cleanVideoId;

    const provider = normalized.provider || normalized.videoMetadata.channel || normalized.source || 'CareerOS Academy';
    normalized.provider = provider;
    normalized.channel = provider;
    normalized.videoMetadata.channel = provider;

    if (platform === 'youtube' && cleanVideoId) {
      // Always enforce canonical privacy-enhanced embed URL
      normalized.embedUrl = `https://www.youtube-nocookie.com/embed/${cleanVideoId}`;
      if (!normalized.sourceUrl || !normalized.sourceUrl.includes('watch?v=')) {
        normalized.sourceUrl = `https://www.youtube.com/watch?v=${cleanVideoId}`;
      }
      if (!normalized.thumbnail || normalized.thumbnail.includes('via.placeholder')) {
        normalized.thumbnail = `https://img.youtube.com/vi/${cleanVideoId}/hqdefault.jpg`;
      }
      normalized.videoMetadata.thumbnail = normalized.thumbnail;
    }
  }

  return normalized;
}

/**
 * Future Pipeline: Discovery -> Extraction -> Ingestion
 */
export async function ingestResourcePipeline(rawCandidate) {
  // Step 1: Normalization
  const normalized = normalizeResourceData(rawCandidate);

  // Step 2: Quality & Validation checks
  if (!normalized.title) throw new Error('Resource title is required');
  if (!normalized.career) throw new Error('Career reference is required');
  if (!normalized.module) throw new Error('Module reference is required');

  // Step 3: Duplicate checks
  if (normalized.type === 'video' && normalized.videoMetadata?.videoId) {
    const isDup = await checkDuplicateVideo(
      normalized.videoMetadata.platform,
      normalized.videoMetadata.videoId
    );
    if (isDup) {
      throw new Error(`Duplicate video detected: ${normalized.videoMetadata.platform} / ${normalized.videoMetadata.videoId}`);
    }
  }

  // Step 4: Initial lifecycle state
  normalized.status = normalized.status || 'review';

  return normalized;
}

export default {
  STATUS_TRANSITIONS,
  extractVideoId,
  generateSlug,
  parseDurationMinutes,
  checkDuplicateVideo,
  checkDuplicateSlug,
  normalizeResourceData,
  ingestResourcePipeline
};
