import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Binary, Flame, Award, CheckCircle2, TrendingUp, Sparkles, Target, Plus, Minus, Pencil, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import { saveDSA } from '../utils/storage';
import { useToast } from '../context/ToastContext';
import DSAModal from '../components/DSAModal';

export default function DSAPage() {
  const { showToast } = useToast();
  const [dsaData, setDsaData] = useState({ topics: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTopic, setEditingTopic] = useState(null);

  const fetchDSA = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.dsa.getAll();
      if (res && res.success && Array.isArray(res.data)) {
        const topics = res.data;
        const totalSolved = topics.reduce((acc, t) => acc + (Number(t.solved) || 0), 0);
        const targetGoal = topics.reduce((acc, t) => acc + (Number(t.total) || 0), 0);
        const formatted = {
          topics,
          summary: {
            totalSolved,
            targetGoal,
            ...(res.summary || {}),
            activeStreakDays: 14,
            acceptanceRate: '76.4%'
          }
        };
        setDsaData(formatted);
        saveDSA(formatted);
      } else {
        setError(res?.message || 'Failed to retrieve DSA topics from database');
      }
    } catch (err) {
      setError(err.message || 'An unexpected network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDSA();
  }, []);

  const topics = dsaData.topics || [];
  const totalSolved = topics.reduce((acc, t) => acc + (Number(t.solved) || 0), 0);
  const totalTarget = topics.reduce((acc, t) => acc + (Number(t.total) || 0), 0);
  const completionPercentage = totalTarget > 0 ? Math.round((totalSolved / totalTarget) * 100) : 0;

  const easyTotal = topics.reduce((acc, t) => acc + (Number(t.easy) || 0), 0);
  const mediumTotal = topics.reduce((acc, t) => acc + (Number(t.medium) || 0), 0);
  const hardTotal = topics.reduce((acc, t) => acc + (Number(t.hard) || 0), 0);

  const handleStepSolved = async (topic, delta) => {
    const currentSolved = Number(topic.solved) || 0;
    const currentTotal = Number(topic.total) || 20;
    const nextSolved = currentSolved + delta;

    if (nextSolved < 0) {
      showToast(`Cannot have less than 0 solved problems in ${topic.topic}.`, 'error');
      return;
    }

    if (nextSolved > currentTotal) {
      showToast(`Cannot exceed total problems (${currentTotal}) in ${topic.topic}.`, 'error');
      return;
    }

    const topicId = topic._id || topic.id || topic.topic;

    // Optimistic update
    const updatedTopics = topics.map((t) =>
      (t._id === topic._id || t.id === topic.id || t.topic === topic.topic)
        ? { ...t, solved: nextSolved } 
        : t
    );

    const updatedDsa = {
      ...dsaData,
      topics: updatedTopics,
      summary: {
        ...dsaData.summary,
        totalSolved: updatedTopics.reduce((acc, t) => acc + (Number(t.solved) || 0), 0),
        targetGoal: updatedTopics.reduce((acc, t) => acc + (Number(t.total) || 0), 0)
      }
    };

    setDsaData(updatedDsa);

    try {
      const res = await api.dsa.update(topicId, {
        solved: nextSolved,
        total: currentTotal,
        easy: topic.easy,
        medium: topic.medium,
        hard: topic.hard
      });

      if (res && res.success && res.data) {
        const syncedTopics = topics.map((t) =>
          (t._id === topic._id || t.id === topic.id || t.topic === topic.topic)
            ? { ...t, ...res.data }
            : t
        );
        const syncedDsa = {
          ...dsaData,
          topics: syncedTopics,
          summary: {
            ...dsaData.summary,
            totalSolved: syncedTopics.reduce((acc, t) => acc + (Number(t.solved) || 0), 0),
            targetGoal: syncedTopics.reduce((acc, t) => acc + (Number(t.total) || 0), 0)
          }
        };
        setDsaData(syncedDsa);
        saveDSA(syncedDsa);
        showToast(`${delta > 0 ? '+1' : '-1'} problem in ${topic.topic} (${nextSolved}/${currentTotal})`, 'success');
      } else {
        // Rollback
        setDsaData(dsaData);
        showToast(res?.message || 'Failed to update problem count on server', 'error');
      }
    } catch (err) {
      setDsaData(dsaData);
      showToast(err.message || 'Error updating problem count', 'error');
    }
  };

  const handleSaveTopic = async (updatedTopic) => {
    const topicId = updatedTopic._id || updatedTopic.id || updatedTopic.topic;

    try {
      const res = await api.dsa.update(topicId, updatedTopic);
      if (res && res.success && res.data) {
        const updatedTopics = topics.map((t) =>
          (t._id === updatedTopic._id || t.id === updatedTopic.id || t.topic === updatedTopic.topic)
            ? { ...t, ...res.data }
            : t
        );

        const updatedDsa = {
          ...dsaData,
          topics: updatedTopics,
          summary: {
            ...dsaData.summary,
            totalSolved: updatedTopics.reduce((acc, t) => acc + (Number(t.solved) || 0), 0),
            targetGoal: updatedTopics.reduce((acc, t) => acc + (Number(t.total) || 0), 0)
          }
        };

        setDsaData(updatedDsa);
        saveDSA(updatedDsa);
        showToast(`Updated "${updatedTopic.topic}" (${updatedTopic.solved}/${updatedTopic.total})`, 'success');
      } else {
        showToast(res?.message || 'Failed to update topic on server', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error updating topic', 'error');
    } finally {
      setEditingTopic(null);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Banner */}
      <div className="glass-card p-6 sm:p-8 border-cyan-500/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Binary className="w-3.5 h-3.5" />
              <span>Database-Backed Tracking</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Data Structures & Algorithms Tracker
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Systematically prepare for technical coding screens. Track problem patterns, time complexity instincts, and consistency streaks in MongoDB.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Flame className="w-5 h-5 fill-amber-500/30" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {dsaData.summary?.activeStreakDays || 14} Days
                </div>
                <div className="text-[11px] text-slate-400">Current Streak</div>
              </div>
            </div>

            <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {totalSolved} / {totalTarget}
                </div>
                <div className="text-[11px] text-slate-400">{completionPercentage}% Solved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Difficulty Breakdown Badges */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center gap-4 flex-wrap">
          <span className="text-xs font-semibold text-slate-400">Difficulty Split:</span>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Easy: {easyTotal}
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Medium: {mediumTotal}
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Hard: {hardTotal}
            </span>
          </div>
          <span className="text-xs text-slate-400 ml-auto">
            Acceptance Rate: <strong className="text-white">{dsaData.summary?.acceptanceRate || '76.4%'}</strong>
          </span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-4 text-rose-400">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={fetchDSA}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Topics Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            DSA Topic Mastery
          </h2>
          <span className="text-xs text-slate-400">
            Click edit or use + / - to track solved problems
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="glass-card p-5 space-y-4 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="w-24 h-4 bg-white/10 rounded" />
                  <div className="w-12 h-4 bg-white/10 rounded-md" />
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full" />
                <div className="w-20 h-4 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {topics.map((t, idx) => {
                const solved = Number(t.solved) || 0;
                const total = Number(t.total) || 1;
                const topicProgress = total > 0 ? Math.round((solved / total) * 100) : 0;
                const actualId = t._id || t.id || t.topic;

                return (
                  <motion.div
                    key={actualId}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="glass-card-interactive p-5 space-y-4 flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors">
                          {t.topic}
                        </h3>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                            {solved} / {total}
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditingTopic({ ...t, id: actualId })}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Edit Topic Target"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                        <span className="text-emerald-400">E: {t.easy ?? 0}</span>
                        <span>•</span>
                        <span className="text-amber-400">M: {t.medium ?? 0}</span>
                        <span>•</span>
                        <span className="text-rose-400">H: {t.hard ?? 0}</span>
                      </div>
                    </div>

                    {/* Progress bar + Controls */}
                    <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/[0.06]">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Topic Coverage</span>
                          <span className="font-bold text-slate-200">{topicProgress}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/[0.06] overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${t.color || 'from-cyan-500 to-blue-600'} transition-all duration-300`}
                            style={{ width: `${topicProgress}%` }}
                          />
                        </div>
                      </div>

                      {/* Quick increment/decrement buttons */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400 uppercase font-medium">Quick Solve:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStepSolved(t, -1)}
                            disabled={solved <= 0}
                            className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Decrement solved"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-white px-1">{solved}</span>
                          <button
                            type="button"
                            onClick={() => handleStepSolved(t, 1)}
                            disabled={solved >= total}
                            className="p-1 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-cyan-500/30"
                            title="Increment solved"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Edit DSA Topic Modal */}
      <DSAModal
        isOpen={Boolean(editingTopic)}
        onClose={() => setEditingTopic(null)}
        topicData={editingTopic}
        onSave={handleSaveTopic}
      />
    </div>
  );
}
