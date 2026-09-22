import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles, Check } from 'lucide-react';

export default function QuickActionsModal({ isOpen, type, onClose, onSave }) {
  const [inputValue, setInputValue] = useState('');
  const [extraValue, setExtraValue] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const titles = {
    skill: { heading: 'Add New Skill', label: 'Skill Name (e.g. Docker, TypeScript)', extra: 'Proficiency % (0-100)' },
    project: { heading: 'Add New Project', label: 'Project Name (e.g. AI Portfolio)', extra: 'Tech Stack (comma separated)' },
    goal: { heading: 'Add Daily Goal', label: 'Goal Description (e.g. Solve 3 Trees questions)', extra: 'Target Deadline (e.g. Today 8 PM)' }
  };

  const current = titles[type] || titles.goal;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setSuccess(true);
    setTimeout(() => {
      if (onSave) onSave({ type, title: inputValue, extra: extraValue });
      setSuccess(false);
      setInputValue('');
      setExtraValue('');
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md glass-card p-6 border border-white/10 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {current.heading}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {current.label}
              </label>
              <input
                type="text"
                required
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter details..."
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {current.extra}
              </label>
              <input
                type="text"
                value={extraValue}
                onChange={(e) => setExtraValue(e.target.value)}
                placeholder="Optional parameters..."
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <p className="text-[11px] text-slate-400 italic">
              * Note: Day 1 frontend demo provides live UI feedback; persistent storage connects in Day 2.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
              >
                {success ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Confirm & Add</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
