import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Binary, Flame, Award, CheckCircle2, TrendingUp, Sparkles, Target, Plus, Minus, Pencil } from 'lucide-react';
import { getDSA, saveDSA, subscribeToStorage, STORAGE_KEYS } from '../utils/storage';
import DSAModal from '../components/DSAModal';

export default function DSAPage() {
  const [dsaData, setDsaData] = useState(() => getDSA());
  const [editingTopic, setEditingTopic] = useState(null);
  const [toast, setToast] = useState('');

  // Keep state synchronized with LocalStorage events
  useEffect(() => {
    const unsubscribe = subscribeToStorage((key, data) => {
      if (key === STORAGE_KEYS.DSA && data && Array.isArray(data.topics)) {
        setDsaData(data);
      }
    });
    return unsubscribe;
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const topics = dsaData.topics || [];
  const totalSolved = topics.reduce((acc, t) => acc + (Number(t.solved) || 0), 0);
  const totalTarget = topics.reduce((acc, t) => acc + (Number(t.total) || 0), 0);
  const completionPercentage = totalTarget > 0 ? Math.round((totalSolved / totalTarget) * 100) : 0;

  const easyTotal = topics.reduce((acc, t) => acc + (Number(t.easy) || 0), 0);
  const mediumTotal = topics.reduce((acc, t) => acc + (Number(t.medium) || 0), 0);
  const hardTotal = topics.reduce((acc, t) => acc + (Number(t.hard) || 0), 0);

  const handleStepSolved = (topic, delta) => {
    const currentSolved = Number(topic.solved) || 0;
    const currentTotal = Number(topic.total) || 20;
    const nextSolved = currentSolved + delta;

    if (nextSolved < 0) {
      showToast(`Cannot have less than 0 solved problems.`);
      return;
    }

    if (nextSolved > currentTotal) {
      showToast(`Cannot exceed total problems (${currentTotal}).`);
      return;
    }

    const updatedTopics = topics.map((t) =>
      t.topic === topic.topic ? { ...t, solved: nextSolved } : t
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
    showToast(`${delta > 0 ? '+1' : '-1'} problem in ${topic.topic} (${nextSolved}/${currentTotal})`);
  };

  const handleSaveTopic = (updatedTopic) => {
    const updatedTopics = topics.map((t) =>
      t.topic === updatedTopic.topic ? updatedTopic : t
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
    showToast(`Updated "${updatedTopic.topic}" (${updatedTopic.solved}/${updatedTopic.total})`);
    setEditingTopic(null);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-20 right-8 z-50 px-4 py-3 rounded-xl bg-cyan-600 text-white shadow-xl shadow-cyan-600/30 flex items-center gap-2 text-xs font-semibold"
        >
          <Sparkles className="w-4 h-4" />
          <span>{toast}</span>
        </motion.div>
      )}

      {/* Banner */}
      <div className="glass-card p-6 sm:p-8 border-cyan-500/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Binary className="w-3.5 h-3.5" />
              <span>Algorithmic Problem Solving</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Data Structures & Algorithms Tracker
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Systematically prepare for technical coding screens. Track problem patterns, time complexity instincts, and consistency streaks.
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

      {/* Topics Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Core 10 Categories Breakdown
          </h2>
          <span className="text-xs text-slate-400">
            Click edit or use + / - to track solved problems
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence>
            {topics.map((t, idx) => {
              const solved = Number(t.solved) || 0;
              const total = Number(t.total) || 1;
              const topicProgress = total > 0 ? Math.round((solved / total) * 100) : 0;

              return (
                <motion.div
                  key={t.topic}
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
                          onClick={() => setEditingTopic(t)}
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
