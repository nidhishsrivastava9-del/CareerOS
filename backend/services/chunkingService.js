import crypto from 'crypto';

/**
 * CareerOS — Content Chunking Service (Day 10)
 * 
 * Provides deterministic content extraction, cleaning, and semantic chunking
 * for CareerOS learning resources before embedding and vector indexing.
 */

export const DEFAULT_CHUNK_SIZE = 600;
export const DEFAULT_CHUNK_OVERLAP = 80;

/**
 * Computes a deterministic SHA-256 hash of text content for change detection
 */
export function computeContentHash(text = '') {
  return crypto.createHash('sha256').update(String(text).trim()).digest('hex');
}

/**
 * Extracts and cleans text from a CareerOS Resource document
 * Handles multi-modal resources: Theory, Notes, Quiz, PYQs, Practice, Project, Video (metadata only).
 */
export function extractResourceText(resource) {
  if (!resource) return '';

  const sections = [];

  // Header info
  if (resource.title) sections.push(`Title: ${resource.title}`);
  if (resource.subject) sections.push(`Subject: ${resource.subject}`);
  if (resource.topic) sections.push(`Topic: ${resource.topic}`);
  if (resource.description) sections.push(`Overview: ${resource.description}`);

  // 1. Direct Content (Theory, Notes, Articles)
  if (resource.content && typeof resource.content === 'string') {
    sections.push(resource.content);
  }

  // 2. Quiz Metadata (Questions, Answers, Explanations)
  if (resource.quizMetadata?.questions?.length) {
    const quizLines = ['Assessments and Explanations:'];
    resource.quizMetadata.questions.forEach((q, idx) => {
      quizLines.push(`Q${idx + 1}: ${q.question}`);
      if (q.options?.length) {
        quizLines.push(`Options: ${q.options.join(' | ')}`);
      }
      if (typeof q.correctAnswer === 'number' && q.options?.[q.correctAnswer]) {
        quizLines.push(`Correct Answer: ${q.options[q.correctAnswer]}`);
      }
      if (q.explanation) {
        quizLines.push(`Explanation: ${q.explanation}`);
      }
    });
    sections.push(quizLines.join('\n'));
  }

  // 3. Practice Challenge Metadata (Problem, Instructions, Hints)
  if (resource.practiceMetadata) {
    const pm = resource.practiceMetadata;
    const practiceLines = ['Practice Challenge:'];
    if (pm.problemStatement) practiceLines.push(`Problem: ${pm.problemStatement}`);
    if (pm.instructions?.length) practiceLines.push(`Instructions:\n- ${pm.instructions.join('\n- ')}`);
    if (pm.hints?.length) practiceLines.push(`Hints:\n- ${pm.hints.join('\n- ')}`);
    if (pm.solutionCode) practiceLines.push(`Solution Code Overview:\n${pm.solutionCode}`);
    sections.push(practiceLines.join('\n'));
  }

  // 4. PYQ Interview Question Metadata
  if (resource.pyqMetadata?.items?.length) {
    const pyqLines = ['Past Interview Questions:'];
    resource.pyqMetadata.items.forEach((item, idx) => {
      pyqLines.push(`[${item.company} | ${item.role}] Question: ${item.question}`);
      if (item.answerSnippet) {
        pyqLines.push(`Model Answer: ${item.answerSnippet}`);
      }
    });
    sections.push(pyqLines.join('\n'));
  }

  // 5. Project Metadata
  if (resource.projectMetadata) {
    const proj = resource.projectMetadata;
    const projLines = ['Portfolio Project Guide:'];
    if (proj.title) projLines.push(`Project Name: ${proj.title}`);
    if (proj.overview) projLines.push(`Overview: ${proj.overview}`);
    if (proj.features?.length) projLines.push(`Core Features:\n- ${proj.features.join('\n- ')}`);
    if (proj.techStack?.length) projLines.push(`Tech Stack: ${proj.techStack.join(', ')}`);
    sections.push(projLines.join('\n'));
  }

  // 6. Video Metadata (Title, topic, channel only — no unauthorized transcript scraping)
  if (resource.type === 'video' && resource.videoMetadata) {
    const vm = resource.videoMetadata;
    const vidLines = ['Educational Video Reference:'];
    if (vm.channel) vidLines.push(`Channel: ${vm.channel}`);
    if (vm.topic) vidLines.push(`Focus Topic: ${vm.topic}`);
    if (vm.duration) vidLines.push(`Duration: ${vm.duration}`);
    sections.push(vidLines.join('\n'));
  }

  // Clean and normalize text
  const rawText = sections.join('\n\n');
  return cleanText(rawText);
}

/**
 * Cleans raw text by removing non-printable characters and normalizing whitespace
 */
export function cleanText(text = '') {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '') // remove control chars
    .replace(/\n{3,}/g, '\n\n') // collapse multiple blank lines
    .replace(/[ \t]{2,}/g, ' ') // collapse inline spaces
    .trim();
}

/**
 * Splits text into deterministic semantic chunks preserving headings and paragraphs
 */
export function chunkContent(text, options = {}) {
  const maxSize = options.maxChunkSize || DEFAULT_CHUNK_SIZE;
  const overlap = options.chunkOverlap !== undefined ? options.chunkOverlap : DEFAULT_CHUNK_OVERLAP;

  const cleaned = cleanText(text);
  if (!cleaned) return [];

  // If text fits comfortably in one chunk
  if (cleaned.length <= maxSize) {
    return [
      {
        text: cleaned,
        chunkIndex: 0,
        totalChunks: 1,
        contentHash: computeContentHash(cleaned)
      }
    ];
  }

  // Split into paragraphs / markdown blocks
  const paragraphs = cleaned.split(/\n\n+/);
  const rawChunks = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    // If a single paragraph is larger than maxSize, break it into sentence-level chunks
    if (trimmedPara.length > maxSize) {
      if (currentChunk.trim()) {
        rawChunks.push(currentChunk.trim());
        currentChunk = '';
      }

      const sentences = trimmedPara.split(/(?<=[.!?])\s+/);
      let subChunk = '';

      for (const sentence of sentences) {
        if ((subChunk + ' ' + sentence).length > maxSize) {
          if (subChunk.trim()) rawChunks.push(subChunk.trim());
          subChunk = sentence;
        } else {
          subChunk = subChunk ? `${subChunk} ${sentence}` : sentence;
        }
      }

      if (subChunk.trim()) {
        currentChunk = subChunk;
      }
      continue;
    }

    // Normal paragraph accumulation
    if ((currentChunk + '\n\n' + trimmedPara).length > maxSize) {
      if (currentChunk.trim()) {
        rawChunks.push(currentChunk.trim());
        
        // Add overlap from tail of previous chunk if overlap requested
        if (overlap > 0 && currentChunk.length > overlap) {
          const overlapText = currentChunk.slice(-overlap).trim();
          currentChunk = overlapText + '\n\n' + trimmedPara;
        } else {
          currentChunk = trimmedPara;
        }
      } else {
        currentChunk = trimmedPara;
      }
    } else {
      currentChunk = currentChunk ? `${currentChunk}\n\n${trimmedPara}` : trimmedPara;
    }
  }

  if (currentChunk.trim()) {
    rawChunks.push(currentChunk.trim());
  }

  // Ensure chunks are uniquely numbered and have content hashes
  const totalChunks = rawChunks.length;
  return rawChunks.map((chunkText, idx) => ({
    text: chunkText,
    chunkIndex: idx,
    totalChunks,
    contentHash: computeContentHash(chunkText)
  }));
}

export default {
  DEFAULT_CHUNK_SIZE,
  DEFAULT_CHUNK_OVERLAP,
  computeContentHash,
  extractResourceText,
  cleanText,
  chunkContent
};
