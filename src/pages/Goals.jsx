import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, CheckCircle2, Circle, Clock, Sparkles, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { getGoals, saveGoals, subscribeToStorage, STORAGE_KEYS } from '../utils/storage';
import GoalModal from '../components/GoalModal';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';

const TABS = ['All', 'Daily', 'Short-Term', 'Long-Term'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export default function GoalsPage() {
  const [goals, setGoals] = useState(() => getGoals());
  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deletingGoal, setDeletingGoal] = useState(null);
  const [toast, setToast] = useState('');

  // Keep state synchronized with LocalStorage events
  useEffect(() => {
    const unsubscribe = subscribeToStorage((key, data) => {
      if (key === STORAGE_KEYS.GOALS && Array.isArray(data)) {
        setGoals(data);
      }
    });
    return unsubscribe;
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const toggleGoal = (id) => {
    const updated = goals.map((g) => {
      if (g.id === id) {
        const nextDone = !(g.completed || g.status === 'Completed');
        return {
          ...g,
          completed: nextDone,
          status: nextDone ? 'Completed' : 'In Progress',
          progress: nextDone ? 100 : (g.progress === 100 ? 50 : (g.progress || 0))
        };
      }
      return g;
    });

    setGoals(updated);
    saveGoals(updated);
    const target = updated.find(g => g.id === id);
    if (target?.completed) {
      showToast(`Completed: "${target.title || target.task}" 🎉`);
    }
  };

  const handleCyclePriority = (e, goal) => {
    e.stopPropagation();
    const currIdx = PRIORITIES.indexOf(goal.priority || 'Medium');
    const nextPriority = PRIORITIES[(currIdx + 1) % PRIORITIES.length];

    const updated = goals.map(g => (g.id === goal.id ? { ...g, priority: nextPriority } : g));
    setGoals(updated);
    saveGoals(updated);
    showToast(`Priority set to ${nextPriority} for "${goal.title || goal.task}"`);
  };

  const handleSaveGoal = (savedGoal) => {
    let updated;
    const exists = goals.some(g => g.id === savedGoal.id);

    if (exists) {
      updated = goals.map(g => (g.id === savedGoal.id ? savedGoal : g));
      showToast(`Updated goal: "${savedGoal.title}"`);
    } else {
      updated = [savedGoal, ...goals];
      showToast(`Added goal: "${savedGoal.title}"`);
    }

    setGoals(updated);
    saveGoals(updated);
    setEditingGoal(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingGoal) return;
    const updated = goals.filter(g => g.id !== deletingGoal.id);
    setGoals(updated);
    saveGoals(updated);
    showToast(`Removed goal: "${deletingGoal.title || deletingGoal.task}"`);
    setDeletingGoal(null);
  };

  const filteredGoals = activeTab === 'All' 
    ? goals 
    : goals.filter(g => g.category?.toLowerCase() === activeTab.toLowerCase());

  const completedCount = goals.filter(g => g.completed || g.status === 'Completed').length;
  const successRate = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

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

      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Target className="w-3.5 h-3.5" />
            <span>Target Execution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Career Goals & Milestones
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Break macro career visions into actionable daily, weekly, and quarterly targets.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 text-center min-w-[110px]">
            <div className="text-2xl font-black text-cyan-400">{completedCount} / {goals.length}</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">Completed</div>
          </div>
          <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 text-center min-w-[110px]">
            <div className="text-2xl font-black text-emerald-400">{successRate}%</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Tabs and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all
                ${activeTab === tab 
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30' 
                  : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-white hover:bg-white/[0.08]'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/20 hover:shadow-cyan-600/40 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goals List or Empty State */}
      {filteredGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title={goals.length === 0 ? 'No goals created yet' : `No goals found in "${activeTab}"`}
          description={
            goals.length === 0 
              ? 'Stay focused and accountable by defining your first technical goal.'
              : 'Try viewing another category or add a new goal for this milestone timeline.'
          }
          actionText="Add New Goal"
          onAction={() => {
            setEditingGoal(null);
            setIsModalOpen(true);
          }}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/10 border-cyan-500/20"
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredGoals.map((g, idx) => {
              const isDone = Boolean(g.completed || g.status === 'Completed');
              const displayText = g.title || g.task || 'Untitled Goal';
              const priority = g.priority || 'Medium';

              const priorityBadgeColors = {
                High: 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20',
                Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
                Low: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20'
              };

              return (
                <motion.div
                  key={g.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => toggleGoal(g.id)}
                  className={`glass-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none transition-all group relative overflow-hidden
                    ${isDone ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'hover:border-cyan-500/30'}`}
                >
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGoal(g.id);
                      }}
                      className="mt-0.5 sm:mt-0 flex-shrink-0 text-cyan-400 focus:outline-none"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm sm:text-base font-semibold transition-all truncate ${
                        isDone ? 'line-through text-slate-500 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {displayText}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                          {g.category}
                        </span>
                        {g.deadline && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            {g.deadline}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 sm:justify-end flex-wrap sm:flex-nowrap">
                    {/* Interactive Priority Badge */}
                    <button
                      type="button"
                      onClick={(e) => handleCyclePriority(e, g)}
                      title="Click to cycle priority"
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                        priorityBadgeColors[priority] || priorityBadgeColors.Medium
                      }`}
                    >
                      <span>{priority}</span>
                      <ChevronDown className="w-3 h-3 opacity-60" />
                    </button>

                    {/* Progress Bar */}
                    <div className="w-20 sm:w-28 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Progress</span>
                        <span>{isDone ? '100%' : `${g.progress || 0}%`}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isDone ? 'bg-emerald-500' : 'bg-cyan-500'
                          }`}
                          style={{ width: `${isDone ? 100 : (g.progress || 0)}%` }}
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingGoal(g);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Edit Goal"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingGoal(g);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        initialData={editingGoal}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingGoal)}
        onClose={() => setDeletingGoal(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Goal"
        message={`Are you sure you want to delete "${deletingGoal?.title || deletingGoal?.task}"?`}
        confirmText="Delete Goal"
      />
    </div>
  );
}
