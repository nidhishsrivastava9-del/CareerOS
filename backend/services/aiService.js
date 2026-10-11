import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import { buildUserContext, formatSystemContextPrompt } from './contextBuilder.js';
import { getAiProvider } from './aiProvider.js';

/**
 * CareerOS Helping AI Orchestration Service (Day 9)
 * 
 * Manages conversational context, provider dispatch, user isolation,
 * and conversation history persistence.
 */

const MAX_MESSAGE_LENGTH = 3000;
const MAX_HISTORY_MESSAGES = 12;

const BASE_SYSTEM_PROMPT = `
You are CareerOS Helping AI, an expert, encouraging, and highly technical engineering mentor.
Your mission is to help students successfully master their tech roadmap, prepare for software engineering roles, and build deep conceptual understanding.

Core Teaching Guidelines:
1. Ground your guidance in the student's current CareerOS roadmap, module, and learning progress.
2. Provide clear, concise explanations using real-world analogies and industry best practices.
3. Format code examples neatly in markdown with specific language identifiers (e.g. \`\`\`javascript).
4. Encourage deliberate practice: break down problems into logical steps rather than just giving away final answers.
5. When addressing bugs, explain the root cause clearly before presenting the fixed snippet.
`.trim();

/**
 * Generate a short, relevant title from the initial user prompt
 */
function generateConversationTitle(prompt = '') {
  const clean = prompt.replace(/[#*`_]/g, '').trim();
  if (!clean) return 'Learning Discussion';
  const words = clean.split(/\s+/).slice(0, 6).join(' ');
  return words.length > 40 ? `${words.slice(0, 37)}...` : words;
}

/**
 * In-memory conversation store fallback if MongoDB is offline or in disconnected test state
 */
const memoryConversations = new Map();

/**
 * Process a user message within an authenticated context
 */
export async function processUserMessage({
  userId,
  conversationId,
  message,
  careerSlug = 'full-stack-developer',
  moduleSlug = '',
  topic = ''
}) {
  if (!userId) {
    throw new Error('User authentication is required to access CareerOS Helping AI');
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new Error('Message content is required and cannot be empty');
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message exceeds maximum permitted length of ${MAX_MESSAGE_LENGTH} characters`);
  }

  const isDbConnected = mongoose.connection.readyState === 1;

  // 1. Gather comprehensive student context (user-isolated)
  const userContext = await buildUserContext(userId, {
    careerSlug,
    moduleSlug,
    topic,
    message: trimmedMessage
  });

  // 2. Format system prompt with personalized student details
  const contextPrompt = formatSystemContextPrompt(userContext);
  const fullSystemPrompt = `${BASE_SYSTEM_PROMPT}\n\n${contextPrompt}`;

  // 3. Retrieve or create conversation record
  let convDoc = null;
  const targetConvId = conversationId || `conv-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  if (isDbConnected) {
    try {
      convDoc = await Conversation.findOne({
        conversationId: targetConvId,
        user: userId
      });

      if (!convDoc) {
        convDoc = new Conversation({
          user: userId,
          conversationId: targetConvId,
          title: generateConversationTitle(trimmedMessage),
          careerSlug,
          moduleSlug,
          topic,
          messages: []
        });
      } else {
        // Update context fields if provided
        if (careerSlug) convDoc.careerSlug = careerSlug;
        if (moduleSlug) convDoc.moduleSlug = moduleSlug;
        if (topic) convDoc.topic = topic;
      }
    } catch (err) {
      console.warn('[AI Service] DB find/create error, using fallback:', err.message);
    }
  } else {
    // Memory fallback
    const memKey = `${userId}:${targetConvId}`;
    convDoc = memoryConversations.get(memKey) || {
      user: userId,
      conversationId: targetConvId,
      title: generateConversationTitle(trimmedMessage),
      careerSlug,
      moduleSlug,
      topic,
      messages: [],
      save: async function() {
        memoryConversations.set(memKey, this);
        return this;
      }
    };
  }

  // 4. Construct multi-turn messages array for AI provider
  const recentHistory = (convDoc.messages || [])
    .slice(-MAX_HISTORY_MESSAGES)
    .map(m => ({
      role: m.role,
      content: m.content
    }));

  const messagesForAi = [
    ...recentHistory,
    { role: 'user', content: trimmedMessage }
  ];

  // 5. Dispatch to configured AI provider (Mock or Gemini)
  const provider = getAiProvider();
  const aiResult = await provider.generateResponse({
    messages: messagesForAi,
    systemPrompt: fullSystemPrompt,
    userContext
  });

  const assistantReply = aiResult.content || 'I could not generate a response. Please try again.';

  // Format RAG sources from retrieved knowledge chunks (deduplicated by resourceId)
  const seenResourceIds = new Set();
  const sources = [];
  for (const k of (userContext.retrievedKnowledge || [])) {
    if (!seenResourceIds.has(k.resourceId)) {
      seenResourceIds.add(k.resourceId);
      sources.push({
        id: k.resourceId,
        slug: k.resourceSlug,
        title: k.title,
        type: k.sourceType,
        career: k.career,
        module: k.module,
        topic: k.topic,
        label: k.sourceLabel,
        score: k.score,
        url: k.url
      });
    }
  }

  const relatedResources = userContext.relatedResources || [];
  const isGrounded = Boolean(userContext.isGrounded && sources.length > 0);

  // 6. Record user message and assistant reply
  const userMsgObj = {
    role: 'user',
    content: trimmedMessage,
    timestamp: new Date()
  };

  const assistantMsgObj = {
    role: 'assistant',
    content: assistantReply,
    timestamp: new Date(),
    metadata: {
      provider: aiResult.provider || provider.name,
      model: aiResult.model || provider.model,
      sources,
      relatedResources,
      isGrounded
    }
  };

  convDoc.messages.push(userMsgObj, assistantMsgObj);

  // If first user message, refine title
  if (convDoc.messages.filter(m => m.role === 'user').length <= 1) {
    convDoc.title = generateConversationTitle(trimmedMessage);
  }

  // 7. Persist updated conversation
  if (isDbConnected && typeof convDoc.save === 'function') {
    await convDoc.save();
  } else if (typeof convDoc.save === 'function') {
    await convDoc.save();
  }

  return {
    conversationId: convDoc.conversationId,
    title: convDoc.title,
    careerSlug: convDoc.careerSlug,
    moduleSlug: convDoc.moduleSlug,
    topic: convDoc.topic,
    messages: convDoc.messages,
    latestReply: assistantReply,
    provider: aiResult.provider || provider.name,
    model: aiResult.model || provider.model,
    sources,
    relatedResources,
    isGrounded,
    userContext: {
      student: userContext.student,
      career: userContext.career,
      module: userContext.module,
      progress: userContext.progress,
      weakAreas: userContext.weakAreas
    }
  };
}

/**
 * Get all conversations for the authenticated user (user-isolated)
 */
export async function getUserConversations(userId, options = {}) {
  const { limit = 20, page = 1 } = options;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    const skip = (Math.max(1, page) - 1) * limit;
    const [conversations, total] = await Promise.all([
      Conversation.find({ user: userId })
        .select('conversationId title careerSlug moduleSlug topic updatedAt createdAt messages')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Conversation.countDocuments({ user: userId })
    ]);

    return {
      conversations: conversations.map(c => ({
        id: c.conversationId,
        conversationId: c.conversationId,
        title: c.title,
        careerSlug: c.careerSlug,
        moduleSlug: c.moduleSlug,
        topic: c.topic,
        messageCount: c.messages ? c.messages.length : 0,
        lastMessage: c.messages && c.messages.length ? c.messages[c.messages.length - 1].content.slice(0, 100) : '',
        updatedAt: c.updatedAt,
        createdAt: c.createdAt
      })),
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  // Memory fallback
  const userConvs = [];
  for (const [key, conv] of memoryConversations.entries()) {
    if (key.startsWith(`${userId}:`)) {
      userConvs.push({
        id: conv.conversationId,
        conversationId: conv.conversationId,
        title: conv.title,
        careerSlug: conv.careerSlug,
        moduleSlug: conv.moduleSlug,
        topic: conv.topic,
        messageCount: conv.messages.length,
        lastMessage: conv.messages.length ? conv.messages[conv.messages.length - 1].content.slice(0, 100) : '',
        updatedAt: new Date(),
        createdAt: new Date()
      });
    }
  }

  return {
    conversations: userConvs,
    total: userConvs.length,
    page: 1,
    pages: 1
  };
}

/**
 * Get a specific conversation by ID (user-isolated)
 */
export async function getConversationById(userId, conversationId) {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    const conv = await Conversation.findOne({
      user: userId,
      conversationId
    }).lean();

    if (!conv) {
      const err = new Error('Conversation not found');
      err.statusCode = 404;
      throw err;
    }

    return {
      id: conv.conversationId,
      conversationId: conv.conversationId,
      title: conv.title,
      careerSlug: conv.careerSlug,
      moduleSlug: conv.moduleSlug,
      topic: conv.topic,
      messages: conv.messages || [],
      updatedAt: conv.updatedAt,
      createdAt: conv.createdAt
    };
  }

  const memKey = `${userId}:${conversationId}`;
  const conv = memoryConversations.get(memKey);
  if (!conv) {
    const err = new Error('Conversation not found');
    err.statusCode = 404;
    throw err;
  }

  return conv;
}

/**
 * Delete a specific conversation by ID (user-isolated)
 */
export async function deleteConversation(userId, conversationId) {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    const result = await Conversation.findOneAndDelete({
      user: userId,
      conversationId
    });

    if (!result) {
      const err = new Error('Conversation not found or access denied');
      err.statusCode = 404;
      throw err;
    }

    return { success: true, message: 'Conversation deleted successfully' };
  }

  const memKey = `${userId}:${conversationId}`;
  if (memoryConversations.has(memKey)) {
    memoryConversations.delete(memKey);
    return { success: true, message: 'Conversation deleted successfully' };
  }

  const err = new Error('Conversation not found');
  err.statusCode = 404;
  throw err;
}

/**
 * Handle quick predefined AI actions
 */
export async function handleQuickAction({
  userId,
  conversationId,
  action,
  careerSlug,
  moduleSlug,
  topic
}) {
  const quickActionPrompts = {
    'explain': 'Explain the core concepts of this module simply with a clear, real-world example.',
    'practice': 'Give me 5 practice questions for this module to test my understanding.',
    'study-plan': 'I have 2 hours today, what should I study based on my progress?',
    'weak-areas': 'Analyze my progress and tell me my weak areas and what to improve next.',
    'debug': 'What are the most common bugs or gotchas in this topic and how do I debug them?'
  };

  const prompt = quickActionPrompts[action] || quickActionPrompts['explain'];

  return processUserMessage({
    userId,
    conversationId,
    message: prompt,
    careerSlug,
    moduleSlug,
    topic
  });
}

export default {
  processUserMessage,
  getUserConversations,
  getConversationById,
  deleteConversation,
  handleQuickAction
};
