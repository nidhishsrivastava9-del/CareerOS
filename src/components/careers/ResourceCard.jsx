import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Video, 
  HelpCircle, 
  Briefcase, 
  Terminal, 
  Rocket, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Play, 
  Pause, 
  Award, 
  Building2, 
  Lightbulb, 
  Code2, 
  Sparkles 
} from 'lucide-react';
import { resolveVideoResource, getYouTubeEmbedUrl } from '../../utils/videoUtils';

export default function ResourceCard({
  resource,
  isCompleted = false,
  onToggleComplete,
  onSubmitQuiz,
  onCompletePractice
}) {
  const [showSolution, setShowSolution] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const {
    type,
    title,
    description,
    duration,
    difficulty,
    content,
    source,
    sourceUrl,
    embedUrl,
    thumbnail,
    tags = []
  } = resource;

  // Unify metadata from Day 7 embedded structures and Day 8 standalone Resource model
  const vidMeta = resource.videoMetadata || {};
  const quizQuestions = resource.quizMetadata?.questions || resource.quizQuestions || [];
  const pyqs = resource.pyqMetadata?.items || resource.pyqItems || [];
  const practiceTask = resource.practiceMetadata || resource.practiceTask || {};
  const projectSpec = resource.projectMetadata || resource.projectSpec || {};

  // Resolve video metadata dynamically and securely
  const resolvedVideo = type === 'video' ? resolveVideoResource(resource) : null;
  const isEmbeddable = Boolean(resolvedVideo?.isValid && resolvedVideo?.videoId);
  const finalEmbedUrl = isEmbeddable
    ? getYouTubeEmbedUrl(resolvedVideo.videoId, { autoplay: isPlayingVideo })
    : null;
  const finalWatchUrl = resolvedVideo?.watchUrl || sourceUrl || (resolvedVideo?.videoId ? `https://www.youtube.com/watch?v=${resolvedVideo.videoId}` : null);
  const finalThumbnail = resolvedVideo?.thumbnailUrl || thumbnail || vidMeta.thumbnail || '';
  const finalChannel = resolvedVideo?.channel || vidMeta.channel || source || 'CareerOS Academy';
  const finalDuration = resolvedVideo?.duration || vidMeta.duration || duration || '15 mins';
  const finalPlatform = resolvedVideo?.platform || 'youtube';

  const handleSelectOption = (qId, optionIdx) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitQuizInternal = () => {
    if (!quizQuestions || quizQuestions.length === 0) return;
    let score = 0;
    quizQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    if (onSubmitQuiz) {
      onSubmitQuiz(resource.id || resource.slug, score, quizQuestions.length);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  // Render type-specific content
  const renderResourceBody = () => {
    switch (type) {
      case 'theory':
      case 'article':
        return (
          <div className="prose prose-invert max-w-none text-sm text-slate-300 space-y-4">
            {content ? (
              <div className="whitespace-pre-line leading-relaxed bg-white/[0.02] p-5 rounded-2xl border border-white/5 font-sans">
                {content}
              </div>
            ) : (
              <p className="text-slate-400 italic">No text content available.</p>
            )}
          </div>
        );

      case 'notes':
      case 'pdf':
        return (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                <FileText className="w-4 h-4" />
                <span>Executive Summary & Mental Models</span>
              </div>
              <div className="whitespace-pre-line text-sm text-slate-300 leading-relaxed font-sans">
                {content}
              </div>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-xl">
              {isPlayingVideo && isEmbeddable && finalEmbedUrl ? (
                /* Inline Authorized Embedded Video Player */
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    src={finalEmbedUrl}
                    title={title || 'Educational Lecture'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="w-full h-full border-0"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPlayingVideo(false)}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-black text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all z-10 flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <span>Close Player</span>
                  </button>
                </div>
              ) : isEmbeddable ? (
                /* Thumbnail Preview with In-App Play Button */
                <div className="relative aspect-video w-full overflow-hidden group">
                  {finalThumbnail ? (
                    <img
                      src={finalThumbnail}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-center">
                      <Video className="w-16 h-16 text-indigo-400/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPlayingVideo(true)}
                      className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center justify-center shadow-glow-brand hover:scale-110 transition-all cursor-pointer"
                      title="Play lecture inside CareerOS"
                    >
                      <Play className="w-7 h-7 fill-current ml-1" />
                    </button>
                    <span className="text-xs font-semibold text-white/90 bg-black/60 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                      Watch Lecture inside CareerOS
                    </span>
                  </div>
                </div>
              ) : (
                /* Non-Embeddable / Invalid Video Fallback */
                <div className="p-8 text-center bg-slate-900/60 border border-amber-500/20 rounded-2xl m-3 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                    <Video className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-200">{title}</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      In-app playback is unavailable because a valid embeddable YouTube video ID could not be resolved or embedding has been restricted by the provider.
                    </p>
                  </div>
                  {finalWatchUrl && (
                    <a
                      href={finalWatchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                    >
                      <span>Watch on External Platform</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Video Details Bar */}
              <div className="p-4 bg-slate-900/95 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">{finalChannel}</span>
                  <span>•</span>
                  <span>{finalDuration}</span>
                  <span>•</span>
                  <span className="capitalize">{finalPlatform}</span>
                </div>
                <div className="flex items-center gap-3">
                  {isEmbeddable && !isPlayingVideo && (
                    <button
                      type="button"
                      onClick={() => setIsPlayingVideo(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Play in CareerOS</span>
                    </button>
                  )}
                  {finalWatchUrl && (
                    <a
                      href={finalWatchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Open source video on YouTube in a new tab"
                    >
                      <span>Watch on YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'quiz':
        const questions = quizQuestions;
        return (
          <div className="space-y-6">
            {questions.map((q, idx) => {
              const selectedIdx = selectedAnswers[q.id];
              return (
                <div key={q.id || idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-100 leading-snug">
                      {q.question}
                    </h4>
                  </div>

                  <div className="space-y-2 pl-9">
                    {(q.options || []).map((opt, oIdx) => {
                      const isSelected = selectedIdx === oIdx;
                      const isCorrect = q.correctAnswer === oIdx;

                      let optClass = 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.06]';
                      if (quizSubmitted) {
                        if (isCorrect) {
                          optClass = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold';
                        } else if (isSelected && !isCorrect) {
                          optClass = 'bg-rose-500/20 border-rose-500/50 text-rose-300';
                        } else {
                          optClass = 'bg-white/[0.01] border-white/5 text-slate-500';
                        }
                      } else if (isSelected) {
                        optClass = 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-semibold';
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() => handleSelectOption(q.id, oIdx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${optClass}`}
                        >
                          <span>{opt}</span>
                          {quizSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && q.explanation && (
                    <div className="ml-9 p-3 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-300 space-y-1">
                      <span className="font-bold text-indigo-400">Explanation:</span>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quiz Action Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              {quizSubmitted ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    {quizScore}/{questions.length}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      Score: {Math.round((quizScore / questions.length) * 100)}%
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {quizScore === questions.length ? 'Perfect score! Knowledge verified.' : 'Review explanations above and retry anytime.'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400">
                  {Object.keys(selectedAnswers).length} of {questions.length} questions answered
                </div>
              )}

              <div className="flex items-center gap-2">
                {quizSubmitted ? (
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] transition-all cursor-pointer"
                  >
                    Retake Quiz
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitQuizInternal}
                    disabled={Object.keys(selectedAnswers).length === 0}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    Submit Assessment
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      case 'pyq':
        return (
          <div className="space-y-4">
            {pyqs.map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-xs text-slate-200">{item.company || 'Tech Interview'}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400">{item.role || 'Software Engineer'}</span>
                  </div>
                  {item.frequency && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Frequency: {item.frequency}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-slate-100">
                  {item.question}
                </h4>

                {item.answerSnippet && (
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/5 text-xs text-slate-300 leading-relaxed font-sans">
                    <div className="font-semibold text-indigo-400 mb-1">Recommended Approach:</div>
                    {item.answerSnippet}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'practice':
        const task = practiceTask;
        return (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <h4 className="text-sm font-bold text-slate-100">Problem Statement</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {task.problemStatement}
              </p>

              {task.instructions && task.instructions.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <h5 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Instructions:</h5>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 pl-1">
                    {task.instructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Starter Code Block */}
            {task.starterCode && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    <span>Starter Code</span>
                  </span>
                </div>
                <pre className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-xs font-mono text-emerald-400 overflow-x-auto">
                  <code>{task.starterCode}</code>
                </pre>
              </div>
            )}

            {/* Hints Accordion */}
            {task.hints && task.hints.length > 0 && (
              <div className="border border-white/5 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowHints(!showHints)}
                  className="w-full flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] text-xs font-semibold text-amber-400 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    <span>Need a hint? ({task.hints.length} available)</span>
                  </span>
                  {showHints ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showHints && (
                  <div className="p-4 bg-slate-900/60 border-t border-white/5 space-y-2 text-xs text-slate-300">
                    {task.hints.map((hint, hIdx) => (
                      <div key={hIdx} className="flex items-start gap-2">
                        <span className="font-bold text-amber-400">#{hIdx + 1}:</span>
                        <span>{hint}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Solution Toggle */}
            {task.solutionCode && (
              <div className="border border-white/5 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowSolution(!showSolution)}
                  className="w-full flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] text-xs font-semibold text-indigo-400 transition-colors cursor-pointer"
                >
                  <span>{showSolution ? 'Hide Model Solution' : 'View Model Solution'}</span>
                  {showSolution ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showSolution && (
                  <pre className="p-4 bg-slate-950 border-t border-white/10 text-xs font-mono text-cyan-300 overflow-x-auto">
                    <code>{task.solutionCode}</code>
                  </pre>
                )}
              </div>
            )}

            {onCompletePractice && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => onCompletePractice(resource.id || resource.slug)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Verify & Mark Challenge Complete</span>
                </button>
              </div>
            )}
          </div>
        );

      case 'project':
        const spec = projectSpec;
        return (
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <div>
              <h4 className="text-base font-bold text-slate-100">{spec.title || title}</h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                {spec.overview || description}
              </p>
            </div>

            {spec.features && spec.features.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Required Features:</div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {spec.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {spec.techStack && spec.techStack.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recommended Tech Stack:</div>
                <div className="flex flex-wrap gap-2">
                  {spec.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 border border-white/10"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="p-4 rounded-xl bg-white/[0.02] text-xs text-slate-300">
            {description}
          </div>
        );
    }
  };

  return (
    <div className={`glass-card p-5 sm:p-6 transition-all duration-200 space-y-4
      ${isCompleted ? 'border-emerald-500/30 shadow-sm shadow-emerald-500/5' : 'hover:border-white/15'}`}>
      {/* Top Resource Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 capitalize">
            {type}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-100">
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 flex-shrink-0">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{duration}</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="px-2 py-0.5 rounded-full bg-white/[0.03] text-slate-300 border border-white/5">
            {difficulty}
          </span>
        </div>
      </div>

      {description && type !== 'practice' && type !== 'project' && (
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {description}
        </p>
      )}

      {/* Dynamic Body Content */}
      <div className="pt-1">
        {renderResourceBody()}
      </div>

      {/* Tags and Complete Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.03] text-slate-400 border border-white/5"
            >
              #{tag}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onToggleComplete && onToggleComplete(resource.id || resource.slug)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105 cursor-pointer
            ${isCompleted 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' 
              : 'bg-white/[0.05] text-slate-300 border border-white/10 hover:bg-indigo-600 hover:text-white hover:border-indigo-500'}`}
        >
          <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span>{isCompleted ? 'Completed' : 'Mark as Complete'}</span>
        </button>
      </div>
    </div>
  );
}
