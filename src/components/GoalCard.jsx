import React from 'react';
import { CheckCircle2, Circle, Target, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GoalCard({ 
  goals: controlledGoals, 
  initialGoals = [], 
  onToggleGoal, 
  onAddGoalClick 
}) {
  const [internalGoals, setInternalGoals] = React.useState(initialGoals);

  const isControlled = Array.isArray(controlledGoals);
  const activeGoals = isControlled ? controlledGoals : internalGoals;

  const toggleGoal = (id) => {
    if (onToggleGoal) {
      onToggleGoal(id);
    } else {
      setInternalGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
      );
    }
  };

  const completedCount = activeGoals.filter((g) => g.completed || g.status === 'Completed').length;
  const totalCount = activeGoals.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="glass-card p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Today's Goals
            </h3>
            <p className="text-[11px] text-slate-400">
              {completedCount} / {totalCount} completed ({completionPercentage}%)
            </p>
          </div>
        </div>

        {/* Mini progress circle */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center text-xs font-bold text-indigo-400 ring-2 ring-indigo-500/30">
            {completionPercentage}%
          </div>
        </div>
      </div>

      {/* Interactive Goal Items */}
      <div className="space-y-2">
        <AnimatePresence>
          {activeGoals.map((goal) => {
            const isDone = Boolean(goal.completed || goal.status === 'Completed');
            const displayText = goal.title || goal.task || goal.text;

            return (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => toggleGoal(goal.id)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none group
                  ${isDone 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400' 
                    : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] text-slate-800 dark:text-slate-200 hover:border-indigo-500/30'}`}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                    className="flex-shrink-0 text-indigo-400 focus:outline-none"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    )}
                  </button>
                  <span className={`text-xs sm:text-sm font-medium transition-all ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                    {displayText}
                  </span>
                </div>

                {goal.deadline && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-200/50 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                    {goal.deadline}
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add new goal action */}
      <button
        type="button"
        onClick={onAddGoalClick}
        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5 border border-dashed border-slate-300 dark:border-white/10 hover:border-indigo-500/40 transition-all"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add a quick goal</span>
      </button>
    </div>
  );
}
