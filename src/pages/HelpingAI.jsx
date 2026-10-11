import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RotateCcw,
  BookOpen,
  Map,
  Compass,
  AlertCircle,
  Copy,
  Check,
  Trash2,
  Plus,
  MessageSquare,
  HelpCircle,
  Code2,
  Clock,
  Target,
  BrainCircuit,
  ChevronDown,
  Layers,
  CheckCircle2,
  ArrowRight,
  FileText,
  Video,
  Database
} from 'lucide-react';
import {
  sendAiChatApi,
  getAiConversationsApi,
  getAiConversationByIdApi,
  deleteAiConversationApi,
  quickAiActionApi,
  getAiContextApi,
  getCareersApi
} from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

/**
 * Custom CodeBlock component with copy functionality and syntax styling
 */
function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/10 bg-[#0d1117] text-xs font-mono shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.04] border-b border-white/5 text-slate-400">
        <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/10 hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-slate-200 leading-relaxed font-mono whitespace-pre">
        {code}
      </div>
    </div>
  );
}

/**
 * Renders verified CareerOS source citations and related learning resources
 */
function SourceReferences({ sources = [], relatedResources = [], isGrounded }) {
  if (!sources?.length && !relatedResources?.length && isGrounded === undefined) {
    return null;
  }

  const getTypeIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'video': return <Video className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />;
      case 'notes': return <FileText className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />;
      case 'quiz': return <HelpCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />;
      case 'practice': return <Code2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />;
      case 'pyq': return <Target className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />;
      default: return <BookOpen className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />;
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-white/10 space-y-2.5">
      {/* Grounded Badge / Citation List */}
      {isGrounded && sources?.length > 0 ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Based on CareerOS Learning Material:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sources.map((s, idx) => (
              <Link
                key={idx}
                to={s.url || `/learn/${s.career || 'full-stack-developer'}/${s.module || 'javascript-core'}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-[11px] text-emerald-200 transition-all group"
                title={s.score ? `Relevance: ${Math.round(s.score * 100)}%` : undefined}
              >
                {getTypeIcon(s.type)}
                <span className="font-semibold truncate max-w-[220px]">{s.title}</span>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
                  {s.type}
                </span>
                <ArrowRight className="w-3 h-3 text-emerald-400/70 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      ) : isGrounded === false ? (
        <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/5">
          <AlertCircle className="w-3 h-3 text-slate-400" />
          <span>General Engineering Knowledge • No matching CareerOS resource</span>
        </div>
      ) : null}

      {/* Related CareerOS Learning Hub Activities */}
      {relatedResources?.length > 0 && (
        <div className="space-y-1 pt-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Related Learning Hub Resources:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {relatedResources.slice(0, 4).map((r, rIdx) => (
              <Link
                key={rIdx}
                to={r.url || `/learn/${r.career || 'full-stack-developer'}/${r.module || 'javascript-core'}`}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-[10px] text-slate-300 hover:text-white transition-colors"
              >
                {getTypeIcon(r.type)}
                <span className="truncate max-w-[160px]">{r.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


/**
 * Lightweight safe markdown renderer for rich AI learning responses
 */
function FormattedMessage({ content }) {
  if (!content) return null;

  // Split into code blocks and normal text blocks
  const parts = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        value: content.slice(lastIndex, match.index)
      });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'javascript',
      value: match[2].trim()
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      value: content.slice(lastIndex)
    });
  }

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {parts.map((part, pIdx) => {
        if (part.type === 'code') {
          return <CodeBlock key={pIdx} language={part.language} code={part.value} />;
        }

        // Format regular text (headings, bold, lists)
        const lines = part.value.split('\n');
        return (
          <div key={pIdx} className="space-y-1.5">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1.5" />;

              // H3 / H4 Headings
              if (trimmed.startsWith('#### ')) {
                return (
                  <h4 key={lIdx} className="text-sm font-bold text-indigo-300 mt-2">
                    {trimmed.replace('#### ', '')}
                  </h4>
                );
              }
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={lIdx} className="text-base font-extrabold text-white mt-3 pb-1 border-b border-white/10">
                    {trimmed.replace('### ', '')}
                  </h3>
                );
              }

              // Blockquote
              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote key={lIdx} className="border-l-2 border-indigo-400 pl-3 py-1 my-1.5 bg-indigo-500/5 text-slate-300 italic text-xs rounded-r-md">
                    {trimmed.replace('> ', '')}
                  </blockquote>
                );
              }

              // List items
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const itemContent = trimmed.substring(2);
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                    <span>{renderInlineStyles(itemContent)}</span>
                  </div>
                );
              }

              // Numbered items
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1">
                    <span className="text-xs font-bold text-indigo-400 min-w-4 flex-shrink-0 mt-0.5">
                      {numMatch[1]}.
                    </span>
                    <span>{renderInlineStyles(numMatch[2])}</span>
                  </div>
                );
              }

              return <p key={lIdx}>{renderInlineStyles(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Format inline bold **text** and `code`
 */
function renderInlineStyles(text) {
  if (!text) return '';
  const tokens = [];
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      tokens.push(
        <strong key={match.index} className="font-bold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      tokens.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded bg-white/10 text-indigo-300 font-mono text-xs"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens;
}

export default function HelpingAI() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const initialCareer = searchParams.get('career') || 'full-stack-developer';
  const initialModule = searchParams.get('module') || 'javascript-core';
  const initialTopic = searchParams.get('topic') || '';

  // Active student context
  const [careerSlug, setCareerSlug] = useState(initialCareer);
  const [moduleSlug, setModuleSlug] = useState(initialModule);
  const [topic, setTopic] = useState(initialTopic);
  const [activeContext, setActiveContext] = useState(null);
  const [careersList, setCareersList] = useState([]);

  // Active chat session state
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Conversation history drawer
  const [conversations, setConversations] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Load user context and initial conversation list
  useEffect(() => {
    const initializeAI = async () => {
      setLoadingInitial(true);
      try {
        const [contextRes, convsRes, careersRes] = await Promise.all([
          getAiContextApi({ careerSlug, moduleSlug, topic }),
          getAiConversationsApi({ limit: 15 }),
          getCareersApi()
        ]);

        if (contextRes?.success && contextRes.context) {
          setActiveContext(contextRes.context);
        }

        if (convsRes?.success && convsRes.conversations) {
          setConversations(convsRes.conversations);
          // If conversations exist, load latest one by default
          if (convsRes.conversations.length > 0 && !conversationId) {
            loadConversation(convsRes.conversations[0].conversationId);
          }
        }

        if (careersRes?.success && careersRes.careers) {
          setCareersList(careersRes.careers);
        }
      } catch (err) {
        console.warn('[HelpingAI Init Error]:', err.message);
      } finally {
        setLoadingInitial(false);
      }
    };

    initializeAI();
  }, [careerSlug, moduleSlug]);

  // Load a selected conversation
  const loadConversation = async (cId) => {
    try {
      const res = await getAiConversationByIdApi(cId);
      if (res?.success && res.conversation) {
        setConversationId(res.conversation.conversationId);
        setMessages(res.conversation.messages || []);
        if (res.conversation.careerSlug) setCareerSlug(res.conversation.careerSlug);
        if (res.conversation.moduleSlug) setModuleSlug(res.conversation.moduleSlug);
        if (res.conversation.topic) setTopic(res.conversation.topic);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load conversation', 'error');
    }
  };

  // Start new clean chat
  const handleStartNewChat = () => {
    setConversationId(null);
    setMessages([]);
    setInputMessage('');
    showToast('Started new Helping AI discussion');
  };

  // Send message
  const handleSendMessage = async (customText = null) => {
    const textToSend = (customText !== null ? customText : inputMessage).trim();
    if (!textToSend || isSending) return;

    // Optimistic user message append
    const tempUserMsg = {
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await sendAiChatApi({
        message: textToSend,
        conversationId,
        careerSlug,
        moduleSlug,
        topic
      });

      if (res?.success) {
        setConversationId(res.conversationId);
        setMessages(res.messages || []);
        if (res.userContext) {
          setActiveContext(res.userContext);
        }

        // Refresh conversation history list
        const convListRes = await getAiConversationsApi({ limit: 15 });
        if (convListRes?.success) {
          setConversations(convListRes.conversations);
        }
      } else {
        throw new Error(res?.message || 'Failed to receive AI reply');
      }
    } catch (err) {
      showToast(err.message || 'AI request failed. Please retry.', 'error');
      // Append friendly error note
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Connection Notice**: I was unable to complete your request (${err.message}). You can retry sending or click one of the quick actions below.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Trigger quick action preset
  const handleTriggerQuickAction = async (actionKey) => {
    if (isSending) return;
    setIsSending(true);

    const actionLabels = {
      'explain': 'Explain this module simply with clear examples',
      'practice': 'Generate 5 practice questions for this module',
      'study-plan': 'Create a personalized 2-hour study plan for today',
      'weak-areas': 'Analyze my progress and diagnose my weak areas',
      'debug': 'Common debugging gotchas for this topic'
    };

    const simulatedUserMsg = {
      role: 'user',
      content: actionLabels[actionKey] || actionKey,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, simulatedUserMsg]);

    try {
      const res = await quickAiActionApi({
        action: actionKey,
        conversationId,
        careerSlug,
        moduleSlug,
        topic
      });

      if (res?.success) {
        setConversationId(res.conversationId);
        setMessages(res.messages || []);
        if (res.userContext) {
          setActiveContext(res.userContext);
        }

        const convListRes = await getAiConversationsApi({ limit: 15 });
        if (convListRes?.success) {
          setConversations(convListRes.conversations);
        }
      } else {
        throw new Error(res?.message || 'Quick action failed');
      }
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (cId, e) => {
    e.stopPropagation();
    try {
      const res = await deleteAiConversationApi(cId);
      if (res?.success) {
        setConversations(prev => prev.filter(c => c.conversationId !== cId));
        if (conversationId === cId) {
          handleStartNewChat();
        }
        showToast('Conversation deleted');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete conversation', 'error');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPills = [
    { key: 'explain', label: '💡 Explain Simply', hint: 'Core concept breakdown' },
    { key: 'practice', label: '🎯 5 Practice Questions', hint: 'Test your knowledge' },
    { key: 'study-plan', label: '⏱️ 2-Hour Study Plan', hint: 'Optimized schedule' },
    { key: 'weak-areas', label: '📊 Diagnose Weak Areas', hint: 'From your skills & quiz data' },
    { key: 'debug', label: '🐛 Debugging Gotchas', hint: 'Common pitfalls' }
  ];

  const overallProgress = activeContext?.progress?.overallPercentage ?? 0;
  const careerTitle = activeContext?.career?.title || 'Full Stack Developer';
  const moduleTitle = activeContext?.module?.title || moduleSlug.replace(/-/g, ' ');
  const weakSkillsList = activeContext?.weakAreas?.skills || [];
  const weakDsaList = activeContext?.weakAreas?.dsa || [];

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-7xl mx-auto space-y-3">
      {/* 1. Top Context & Header Bar */}
      <div className="glass-card p-4 sm:p-5 border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-glow-brand flex-shrink-0">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Helping AI
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  CareerOS Mentor
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Personalized guidance grounded in your enrolled roadmap, modules, and code.
            </p>
          </div>
        </div>

        {/* Dynamic Context Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Career Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold">{careerTitle}</span>
          </div>

          {/* Module Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200">
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-medium text-slate-300 capitalize">{moduleTitle}</span>
          </div>

          {/* Progress Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-bold">{overallProgress}% Complete</span>
          </div>

          {/* RAG Grounding Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">RAG Grounded</span>
          </div>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={handleStartNewChat}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-brand transition-all cursor-pointer ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>

          {/* History Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white text-xs font-medium border border-white/10 transition-all cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>History ({conversations.length})</span>
          </button>
        </div>
      </div>

      {/* Weak Areas Banner if detected */}
      {(weakSkillsList.length > 0 || weakDsaList.length > 0) && (
        <div className="glass-card px-4 py-2.5 bg-amber-500/5 border-amber-500/20 text-xs text-amber-200/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Identified Focus Areas:</strong>{' '}
              {[...weakSkillsList, ...weakDsaList].slice(0, 3).join(', ')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleTriggerQuickAction('weak-areas')}
            className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2 flex-shrink-0 cursor-pointer"
          >
            Review Plan →
          </button>
        </div>
      )}

      {/* 2. Main Chat + History Container */}
      <div className="flex-1 flex gap-4 min-h-0 relative">
        {/* Chat Stream Window */}
        <div className="flex-1 glass-card flex flex-col overflow-hidden border-white/10">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              // Empty State / Welcome Screen
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-glow-brand">
                  <Bot className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">
                    What would you like to master today, {user?.name || 'Learner'}?
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    I have full awareness of your <strong>{careerTitle}</strong> roadmap, current module (<strong>{moduleTitle}</strong>), your {overallProgress}% progress, DSA track, and tracked skills.
                  </p>
                </div>

                {/* Quick Action Cards in Empty State */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                  {quickPills.map(pill => (
                    <button
                      key={pill.key}
                      type="button"
                      onClick={() => handleTriggerQuickAction(pill.key)}
                      className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-indigo-600/10 border border-white/5 hover:border-indigo-500/30 text-left transition-all group cursor-pointer"
                    >
                      <div className="font-semibold text-xs text-slate-200 group-hover:text-indigo-300">
                        {pill.label}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {pill.hint}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Active Conversation Stream
              <>
                {messages.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={index}
                      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-1">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                          isUser
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-tr-sm shadow-md'
                            : 'bg-white/[0.04] border border-white/10 text-slate-200 rounded-tl-sm shadow-inner'
                        }`}
                      >
                        <FormattedMessage content={msg.content} />

                        {!isUser && (
                          <SourceReferences
                            sources={msg.metadata?.sources || []}
                            relatedResources={msg.metadata?.relatedResources || []}
                            isGrounded={msg.metadata?.isGrounded}
                          />
                        )}

                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400/80 pt-1">
                          <span>
                            {msg.timestamp
                              ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : ''}
                          </span>
                          {!isUser && msg.metadata?.model && (
                            <span className="text-[9px] uppercase tracking-wider text-slate-500">
                              {msg.metadata.model}
                            </span>
                          )}
                        </div>
                      </div>

                      {isUser && (
                        <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0 mt-1">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* AI Thinking pulsating state */}
                {isSending && (
                  <div className="flex gap-3 justify-start items-center">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 animate-pulse">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-400 text-xs flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                      <span>Analyzing your code & learning context...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Quick Action Pill Bar above Input */}
          <div className="px-4 py-2 bg-black/20 border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex-shrink-0">
              Suggestions:
            </span>
            {quickPills.map(pill => (
              <button
                key={pill.key}
                type="button"
                disabled={isSending}
                onClick={() => handleTriggerQuickAction(pill.key)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-indigo-600/20 border border-white/5 hover:border-indigo-500/30 text-[11px] text-slate-300 hover:text-white transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                <span>{pill.label}</span>
              </button>
            ))}
          </div>

          {/* Input Box Area */}
          <div className="p-4 bg-slate-900/60 border-t border-white/10">
            <div className="flex items-end gap-2 bg-white/[0.03] border border-white/10 rounded-2xl p-2 focus-within:border-indigo-500/50 transition-colors">
              <textarea
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask anything about ${moduleTitle}, paste code, or request practice challenges... (Enter to send)`}
                rows={2}
                disabled={isSending}
                className="flex-1 bg-transparent border-0 text-slate-100 text-xs focus:ring-0 focus:outline-none resize-none p-1.5 placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isSending}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white shadow-glow-brand transition-all flex-shrink-0 cursor-pointer"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 px-1">
              <span>Shift + Enter for new line • Grounded in {careerTitle}</span>
              <span>{inputMessage.length} / 3000 chars</span>
            </div>
          </div>
        </div>

        {/* 3. Conversation History Drawer (Slide-over or side panel) */}
        {isHistoryOpen && (
          <div className="w-80 glass-card flex flex-col overflow-hidden border-white/10 z-20">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                Previous Discussions
              </h3>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No previous discussions recorded yet.
                </div>
              ) : (
                conversations.map(conv => {
                  const isActive = conv.conversationId === conversationId;
                  return (
                    <div
                      key={conv.conversationId}
                      onClick={() => loadConversation(conv.conversationId)}
                      className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between group ${
                        isActive
                          ? 'bg-indigo-600/20 border border-indigo-500/30 text-white'
                          : 'hover:bg-white/[0.04] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-semibold text-xs truncate">
                          {conv.title || 'Discussion'}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">
                          {conv.moduleSlug || conv.careerSlug || 'General'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteConversation(conv.conversationId, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 hover:text-rose-400 text-slate-500 transition-all flex-shrink-0"
                        title="Delete discussion"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
