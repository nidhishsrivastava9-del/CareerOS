import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Clock, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  BookOpen, 
  Sparkles, 
  Brain, 
  ArrowRight, 
  ShieldCheck, 
  Check,
  TrendingUp,
  History,
  FileText
} from 'lucide-react';
import { 
  getAssessmentByIdApi, 
  submitAssessmentApi, 
  getAssessmentAttemptsApi 
} from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function AssessmentModal({ isOpen, onClose, assessmentId, onSubmitted }) {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: value or [values] }
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' | 'result' | 'review' | 'history'
  const [historyAttempts, setHistoryAttempts] = useState([]);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all' | 'incorrect'

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Load assessment when opened
  useEffect(() => {
    if (!isOpen || !assessmentId) return;

    let isMounted = true;
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        setSubmittedResult(null);
        setActiveTab('quiz');
        setCurrentIndex(0);
        setAnswers({});

        const res = await getAssessmentByIdApi(assessmentId);
        if (!isMounted) return;

        if (res && res.success && res.assessment) {
          setAssessment(res.assessment);
          startTimeRef.current = Date.now();

          // Initialize timer if time limit exists
          if (res.assessment.timeLimitMinutes && res.assessment.timeLimitMinutes > 0) {
            setTimeLeft(res.assessment.timeLimitMinutes * 60);
          } else {
            setTimeLeft(null);
          }

          // Fetch attempt history
          try {
            const histRes = await getAssessmentAttemptsApi({ assessmentId, limit: 5 });
            if (histRes && histRes.success) {
              setHistoryAttempts(histRes.attempts || []);
            }
          } catch (e) {
            console.warn('[AssessmentModal] Failed to fetch attempt history:', e);
          }
        } else {
          showToast(res.message || 'Failed to load assessment', 'error');
          onClose();
        }
      } catch (err) {
        console.error('[AssessmentModal] Error loading assessment:', err);
        showToast('Error loading assessment', 'error');
        onClose();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAssessment();

    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, assessmentId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || activeTab !== 'quiz' || submittedResult) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, activeTab, submittedResult]);

  const handleAutoSubmit = () => {
    showToast('Time expired! Submitting assessment...', 'info');
    handleSubmit();
  };

  const handleOptionSelect = (questionId, optionIndex, isMulti) => {
    if (submittedResult) return;

    setAnswers(prev => {
      if (isMulti) {
        const currentList = Array.isArray(prev[questionId]) ? prev[questionId] : [];
        if (currentList.includes(optionIndex)) {
          return { ...prev, [questionId]: currentList.filter(i => i !== optionIndex) };
        } else {
          return { ...prev, [questionId]: [...currentList, optionIndex].sort((a, b) => a - b) };
        }
      } else {
        return { ...prev, [questionId]: optionIndex };
      }
    });
  };

  const handleSubmit = async () => {
    if (!assessment || submitting) return;

    try {
      setSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const timeTakenSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

      const payload = {
        answers,
        timeTakenSeconds
      };

      const res = await submitAssessmentApi(assessment._id || assessment.id, payload);

      if (res && res.success && res.attempt) {
        setSubmittedResult(res.attempt);
        setActiveTab('result');
        showToast(
          res.attempt.passed 
            ? `Congratulations! Passed with ${res.attempt.percentage}%!` 
            : `Assessment submitted: ${res.attempt.percentage}%. Review recommendations below.`,
          res.attempt.passed ? 'success' : 'info'
        );

        if (onSubmitted) {
          onSubmitted(res.attempt);
        }

        // Refresh attempt history
        try {
          const histRes = await getAssessmentAttemptsApi({ assessmentId, limit: 5 });
          if (histRes && histRes.success) {
            setHistoryAttempts(histRes.attempts || []);
          }
        } catch (e) {
          // ignore
        }
      } else {
        showToast(res.message || 'Submission failed. Please try again.', 'error');
      }
    } catch (err) {
      console.error('[AssessmentModal] Submit error:', err);
      showToast('Error submitting assessment', 'error');
    } finally {
      setSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  const handleRetake = () => {
    setSubmittedResult(null);
    setActiveTab('quiz');
    setCurrentIndex(0);
    setAnswers({});
    startTimeRef.current = Date.now();
    if (assessment?.timeLimitMinutes && assessment.timeLimitMinutes > 0) {
      setTimeLeft(assessment.timeLimitMinutes * 60);
    }
  };

  if (!isOpen) return null;

  const questions = assessment?.questions || [];
  const currentQ = questions[currentIndex];
  const isMulti = currentQ?.type === 'multiple_choice';
  const answeredCount = Object.keys(answers).length;

  const formatTimer = (secs) => {
    if (secs === null) return null;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
                    {assessment?.type?.replace('_', ' ') || 'Assessment Engine'}
                  </span>
                  {assessment?.adaptive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Adaptive Learning
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-100 line-clamp-1">
                  {assessment?.title || 'Loading Assessment...'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Timer */}
              {timeLeft !== null && activeTab === 'quiz' && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
                  timeLeft < 60 
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse' 
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimer(timeLeft)}</span>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
                aria-label="Close assessment"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Bar when submitted */}
          {submittedResult && (
            <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('result')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'result' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Score & Recommendations
              </button>
              <button
                onClick={() => setActiveTab('review')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'review' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Detailed Answer Review
              </button>
              {historyAttempts.length > 0 && (
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Attempt History ({historyAttempts.length})
                </button>
              )}
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm">Preparing assessment questions...</p>
              </div>
            ) : activeTab === 'quiz' ? (
              /* Quiz Taking View */
              <div className="space-y-6">
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Question {currentIndex + 1} of {questions.length}</span>
                    <span>{answeredCount} of {questions.length} answered</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question Card */}
                {currentQ ? (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
                        {currentQ.type.replace('_', ' ')}
                      </span>
                      {currentQ.difficulty && (
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                          currentQ.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          currentQ.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {currentQ.difficulty}
                        </span>
                      )}
                      {currentQ.topic && (
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {currentQ.topic}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
                      {currentQ.question}
                    </h3>

                    {/* Code Snippet Box */}
                    {currentQ.codeSnippet && (
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs sm:text-sm text-indigo-300 overflow-x-auto leading-relaxed">
                        <pre>{currentQ.codeSnippet}</pre>
                      </div>
                    )}

                    {/* Options list */}
                    <div className="space-y-2.5 pt-2">
                      {currentQ.options && currentQ.options.map((opt, optIdx) => {
                        const isSelected = isMulti 
                          ? (answers[currentQ._id || currentQ.id] || []).includes(optIdx)
                          : answers[currentQ._id || currentQ.id] === optIdx;

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleOptionSelect(currentQ._id || currentQ.id, optIdx, isMulti)}
                            className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3 ${
                              isSelected
                                ? 'bg-indigo-600/15 border-indigo-500/60 text-slate-100 shadow-sm shadow-indigo-500/10'
                                : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                            }`}
                          >
                            <div className={`mt-0.5 w-5 h-5 rounded-${isMulti ? 'md' : 'full'} border flex items-center justify-center flex-shrink-0 transition ${
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-500 text-white' 
                                : 'border-slate-600 bg-slate-800'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <span className="text-sm flex-1 leading-snug">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No question data available.</p>
                )}
              </div>
            ) : activeTab === 'result' ? (
              /* Results Screen (Requirement 15) */
              <div className="space-y-6">
                <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 ${
                  submittedResult.passed 
                    ? 'bg-emerald-950/20 border-emerald-500/30' 
                    : 'bg-amber-950/20 border-amber-500/30'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${
                      submittedResult.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {submittedResult.passed ? <Award className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          submittedResult.passed 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {submittedResult.passed ? 'Passed Milestone' : 'Needs Review'}
                        </span>
                        <span className="text-xs text-slate-400">
                          Passing threshold: {submittedResult.passingScore || assessment?.passingScore || 70}%
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-100 mt-1">
                        Score: {submittedResult.percentage}%
                      </h3>
                      <p className="text-xs text-slate-400">
                        {submittedResult.correctCount} of {submittedResult.totalQuestions} questions correct in {Math.round(submittedResult.timeTaken / 60)}m {submittedResult.timeTaken % 60}s
                      </p>
                    </div>
                  </div>

                  {/* Summary Metric Pills */}
                  <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                      <div className="text-xs text-emerald-400 font-semibold">Correct</div>
                      <div className="text-lg font-bold text-slate-100">{submittedResult.correctCount}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                      <div className="text-xs text-rose-400 font-semibold">Incorrect</div>
                      <div className="text-lg font-bold text-slate-100">{submittedResult.incorrectCount}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                      <div className="text-xs text-slate-400 font-semibold">Skipped</div>
                      <div className="text-lg font-bold text-slate-100">{submittedResult.skippedCount}</div>
                    </div>
                  </div>
                </div>

                {/* Topic Performance Diagnostics */}
                {submittedResult.topicPerformance && submittedResult.topicPerformance.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Topic Performance Diagnostics</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {submittedResult.topicPerformance.map((tp, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-200 capitalize">{tp.topic}</span>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${tp.percentage >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                                style={{ width: `${tp.percentage}%` }}
                              />
                            </div>
                            <span className={`text-xs font-bold ${tp.percentage >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {tp.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skill Mastery Recalibration */}
                {submittedResult.masteryRecalibration && submittedResult.masteryRecalibration.length > 0 && (
                  <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>System Skill Mastery Recalibrated</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {submittedResult.masteryRecalibration.map((m, i) => (
                        <div key={i} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center gap-2">
                          <span className="font-medium text-slate-200 capitalize">{m.skill}</span>
                          <span className="text-indigo-400 font-bold">{m.masteryPercentage}%</span>
                          <span className="text-[10px] text-slate-500">({m.confidence} confidence)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personalized Recommendations (Requirement 10 & 11) */}
                {submittedResult.recommendations && submittedResult.recommendations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Adaptive Next Step Recommendations</span>
                    </h4>
                    <div className="space-y-2.5">
                      {submittedResult.recommendations.map((rec, i) => {
                        const recTitle = rec.title || rec.name || 'Recommended Next Step';
                        const recDesc = rec.description || rec.reason || '';
                        const recUrl = rec.targetUrl || rec.link;
                        const recPriority = rec.priority || 'medium';
                        const recDifficulty = rec.difficulty || (recPriority === 'high' ? 'Intermediate' : 'Beginner');
                        const actionText = rec.action || (rec.type === 'review_topic' ? 'Review' : rec.type === 'retest' ? 'Retake' : 'Open');

                        return (
                          <div key={i} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  recPriority === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                  recPriority === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                  'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                }`}>
                                  {recPriority}
                                </span>
                                {recDifficulty && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                                    {recDifficulty}
                                  </span>
                                )}
                                <span className="text-xs font-semibold text-slate-200">{recTitle}</span>
                              </div>
                              {recDesc && <p className="text-xs text-slate-400 leading-relaxed">{recDesc}</p>}
                            </div>
                            {recUrl && (
                              <a
                                href={recUrl}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5 flex-shrink-0"
                              >
                                <span>{actionText}</span>
                                <ArrowRight className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === 'review' ? (
              /* Review Mode (Requirement 16) */
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="text-xs text-slate-400">
                    Review each question, your answer, and verified authoritative explanations.
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setReviewFilter('all')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                        reviewFilter === 'all' ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      All ({submittedResult?.review?.length || 0})
                    </button>
                    <button
                      onClick={() => setReviewFilter('incorrect')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                        reviewFilter === 'incorrect' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Incorrect ({submittedResult?.incorrectCount || 0})
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {(submittedResult?.review || [])
                    .filter(item => reviewFilter === 'all' || !item.isCorrect)
                    .map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-xl border space-y-3 ${
                          item.isCorrect 
                            ? 'bg-slate-950/40 border-slate-800' 
                            : 'bg-rose-950/10 border-rose-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {item.isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                            )}
                            <span className="text-xs font-semibold text-slate-300">
                              Question {idx + 1}
                            </span>
                            <span className="text-[11px] text-slate-500 capitalize">({item.topic})</span>
                          </div>
                          <span className={`text-xs font-bold ${item.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {item.isCorrect ? '+1 Point' : '0 Points'}
                          </span>
                        </div>

                        <p className="text-sm font-medium text-slate-200">{item.question}</p>

                        {item.codeSnippet && (
                          <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300 overflow-x-auto">
                            {item.codeSnippet}
                          </pre>
                        )}

                        {/* Options breakdown */}
                        <div className="space-y-1.5 text-xs">
                          {item.options && item.options.map((opt, oIdx) => {
                            const isLearner = Array.isArray(item.learnerAnswer)
                              ? item.learnerAnswer.includes(oIdx)
                              : item.learnerAnswer === oIdx;
                            const isCorrectOpt = Array.isArray(item.correctAnswers)
                              ? item.correctAnswers.includes(oIdx)
                              : item.correctAnswers === oIdx;

                            return (
                              <div
                                key={oIdx}
                                className={`p-2.5 rounded-lg border flex items-center justify-between ${
                                  isCorrectOpt
                                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300 font-medium'
                                    : isLearner && !isCorrectOpt
                                    ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                                    : 'bg-slate-900/40 border-slate-800 text-slate-400'
                                }`}
                              >
                                <span>{opt}</span>
                                {isCorrectOpt && <span className="text-[10px] text-emerald-400 font-bold">✓ Correct Answer</span>}
                                {isLearner && !isCorrectOpt && <span className="text-[10px] text-rose-400 font-bold">✗ Your Choice</span>}
                              </div>
                            );
                          })}
                        </div>

                        {/* Pedagogical Explanation */}
                        {item.explanation && (
                          <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200/90 leading-relaxed">
                            <span className="font-semibold text-indigo-300">Explanation: </span>
                            {item.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              /* Attempt History View (Requirement 17) */
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Previous Attempts for this Assessment</span>
                </h4>
                {historyAttempts.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No prior attempts found for this assessment.</p>
                ) : (
                  <div className="space-y-2">
                    {historyAttempts.map((att, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                              att.passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {att.passed ? 'Passed' : 'Needs Review'}
                            </span>
                            <span className="text-slate-300 font-semibold">{att.score}/{att.totalQuestions} ({att.percentage}%)</span>
                          </div>
                          <p className="text-slate-500 text-[11px]">
                            {new Date(att.submittedAt).toLocaleDateString()} at {new Date(att.submittedAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {Math.round((att.timeTakenSeconds || att.timeTaken || 0) / 60)}m {((att.timeTakenSeconds || att.timeTaken || 0) % 60)}s
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
            {activeTab === 'quiz' ? (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  {currentIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowConfirmSubmit(true)}
                      disabled={submitting}
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition"
                    >
                      {submitting ? 'Grading...' : 'Submit Assessment'}
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Assessment</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                >
                  Done
                </button>
              </>
            )}
          </div>

          {/* Final Submit Confirmation Modal */}
          {showConfirmSubmit && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
                <h4 className="text-base font-bold text-slate-100">Ready to Submit?</h4>
                <p className="text-xs text-slate-400">
                  You have answered <span className="font-semibold text-slate-200">{answeredCount} of {questions.length}</span> questions.
                  {answeredCount < questions.length && (
                    <span className="block mt-1 text-amber-400">
                      Warning: Unanswered questions will be counted as skipped.
                    </span>
                  )}
                </p>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmSubmit(false)}
                    className="px-4 py-1.5 rounded-lg border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-800"
                  >
                    Back to Review
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1"
                  >
                    {submitting ? 'Grading...' : 'Confirm Submission'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
