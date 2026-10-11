import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, CheckCircle2, Circle, Clock, Sparkles, Pencil, Trash2, ChevronDown, Loader2, AlertCircle, RefreshCw, Database } from 'lucide-react';
import api from '../utils/api';
import { saveGoals } from '../utils/storage';
import { useToast } from '../context/ToastContext';
import GoalModal from '../components/GoalModal';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';

const TABS = ['All', 'Daily', 'Short-Term', 'Long-Term', 'DSA', 'Learning', 'Development', 'Architecture'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export default function GoalsPage() {
  const { showToast } = useToast();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deletingGoal, setDeletingGoal] = useState(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.goals.getAll();
      if (res && res.success && Array.isArray(res.data)) {
        setGoals(res.data);
        saveGoals(res.data);
      } else {
        setError(res?.message || 'Failed to load goals from database');
      }
    } catch (err) {
      setError(err.message || 'An unexpected network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const toggleGoal = async (targetId) => {
    const goal = goals.find(g => (g._id === targetId || g.id === targetId));
    if (!goal) return;

    const actualId = goal._id || goal.id;
    const isCurrentlyDone = Boolean(goal.completed || goal.status === 'Completed');
    const nextDone = !isCurrentlyDone;

    // Optimistic update
    const updated = goals.map((g) => {
      if (g._id === actualId || g.id === actualId) {
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

    try {
      const res = await api.goals.update(actualId, {
        completed: nextDone,
        status: nextDone ? 'Completed' : 'In Progress'
      });

      if (res && res.success && res.data) {
        const synced = goals.map(g => (g._id === actualId || g.id === actualId ? res.data : g));
        setGoals(synced);
        saveGoals(synced);
        if (nextDone) {
          showToast(`Goal completed: "${goal.title || goal.task}" 🎉`, 'success');
        } else {
          showToast(`Goal marked in progress: "${goal.title || goal.task}"`, 'info');
        }
      } else {
        // Rollback
        setGoals(goals);
        showToast(res?.message || 'Failed to update goal status', 'error');
      }
    } catch (err) {
      setGoals(goals);
      showToast(err.message || 'Error updating goal', 'error');
    }
  };

  const handleCyclePriority = async (e, goal) => {
    e.stopPropagation();
    const currIdx = PRIORITIES.indexOf(goal.priority || 'Medium');
    const nextPriority = PRIORITIES[(currIdx + 1) % PRIORITIES.length];
    const actualId = goal._id || goal.id;

    // Optimistic update
    const updated = goals.map(g => (g._id === actualId || g.id === actualId ? { ...g, priority: nextPriority } : g));
    setGoals(updated);

    try {
      const res = await api.goals.update(actualId, { priority: nextPriority });
      if (res && res.success && res.data) {
        const synced = goals.map(g => (g._id === actualId || g.id === actualId ? res.data : g));
        setGoals(synced);
        saveGoals(synced);
        showToast(`Priority set to ${nextPriority} for "${goal.title || goal.task}"`, 'info');
      } else {
        setGoals(goals);
        showToast(res?.message || 'Failed to update priority', 'error');
      }
    } catch (err) {
      setGoals(goals);
      showToast(err.message || 'Error updating priority', 'error');
    }
  };

  const handleSaveGoal = async (savedGoal) => {
    try {
      const exists = goals.some(g => g.id === savedGoal.id || g._id === savedGoal.id);
      let updated;

      if (exists) {
        const targetId = savedGoal.id || savedGoal._id;
        const res = await api.goals.update(targetId, savedGoal);
        if (res && res.success && res.data) {
          const item = res.data;
          updated = goals.map(g => (g.id === targetId || g._id === targetId ? item : g));
          showToast(`Goal updated: "${item.title || item.task}"`, 'success');
        } else {
          showToast(res?.message || 'Failed to update goal', 'error');
          return;
        }
      } else {
        const res = await api.goals.create(savedGoal);
        if (res && res.success && res.data) {
          const item = res.data;
          updated = [item, ...goals];
          showToast(`Goal added: "${item.title || item.task}"`, 'success');
        } else {
          showToast(res?.message || 'Failed to save goal', 'error');
          return;
        }
      }

      setGoals(updated);
      saveGoals(updated);
      setEditingGoal(null);
    } catch (err) {
      showToast(err.message || 'Error saving goal', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGoal) return;
    const targetId = deletingGoal._id || deletingGoal.id;
    try {
      const res = await api.goals.delete(targetId);
      if (res && res.success) {
        const updated = goals.filter(g => g._id !== targetId && g.id !== targetId);
        setGoals(updated);
        saveGoals(updated);
        showToast(`Goal removed: "${deletingGoal.title || deletingGoal.task}"`, 'info');
      } else {
        showToast(res?.message || 'Failed to delete goal', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error deleting goal', 'error');
    } finally {
      setDeletingGoal(null);
    }
  };

  const handleSeedSampleGoals = async () => {
    try {
      setIsSeeding(true);
      const res = await api.seed(false);
      if (res && res.success) {
        showToast('Sample milestones loaded into database!', 'success');
        await fetchGoals();
      } else {
        showToast(res?.message || 'Could not seed sample goals', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Error seeding sample goals', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredGoals = activeTab === 'All' 
    ? goals 
    : goals.filter(g => g.category?.toLowerCase() === activeTab.toLowerCase());

  const completedCount = goals.filter(g => g.completed || g.status === 'Completed').length;
  const successRate = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Target className="w-3.5 h-3.5" />
            <span>Database-Backed Execution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Career Goals & Milestones
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Break macro career visions into actionable daily, weekly, and quarterly targets persisted in MongoDB.
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

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-4 text-rose-400">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={fetchGoals}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

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

        <div className="flex items-center gap-2.5 flex-shrink-0">
          {goals.length === 0 && !loading && (
            <button
              onClick={handleSeedSampleGoals}
              disabled={isSeeding}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition-all"
            >
              {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
              <span>Load Sample Goals</span>
            </button>
          )}

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
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-5 flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/10" />
                <div className="space-y-1.5">
                  <div className="w-48 h-4 bg-white/10 rounded" />
                  <div className="w-24 h-3 bg-white/5 rounded" />
                </div>
              </div>
              <div className="w-24 h-3 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title={goals.length === 0 ? 'No goals created yet' : `No goals found in "${activeTab}"`}
          description={
            goals.length === 0 
              ? 'Stay focused and accountable by defining your first technical goal, or load starter milestones.'
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
              const actualId = g._id || g.id;
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
                  key={actualId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => toggleGoal(actualId)}
                  className={`glass-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none transition-all group relative overflow-hidden
                    ${isDone ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'hover:border-cyan-500/30'}`}
                >
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGoal(actualId);
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
                      {g.description && (
                        <p className={`text-xs mt-0.5 line-clamp-1 ${isDone ? 'line-through text-slate-500' : 'text-slate-400'}`}>
                          {g.description}
                        </p>
                      )}
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
                          setEditingGoal({ ...g, id: actualId });
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
                          setDeletingGoal({ ...g, id: actualId });
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
        message={`Are you sure you want to delete "${deletingGoal?.title || deletingGoal?.task}"? It will be removed from your database.`}
        confirmText="Delete Goal"
      />
    </div>
  );
}
