import React, { useState, useEffect } from 'react';
import { Binary, Check, Plus, Minus } from 'lucide-react';
import Modal from './Modal';

export default function DSAModal({
  isOpen,
  onClose,
  topicData = null,
  onSave
}) {
  const [solved, setSolved] = useState(0);
  const [total, setTotal] = useState(20);
  const [easy, setEasy] = useState(0);
  const [medium, setMedium] = useState(0);
  const [hard, setHard] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (topicData) {
      setSolved(Number(topicData.solved) || 0);
      setTotal(Number(topicData.total) || 20);
      setEasy(Number(topicData.easy) || 0);
      setMedium(Number(topicData.medium) || 0);
      setHard(Number(topicData.hard) || 0);
      setError('');
    }
  }, [topicData, isOpen]);

  const calculatedPercent = total > 0 ? Math.round((solved / total) * 100) : 0;

  const handleSolvedChange = (val) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      setSolved(0);
      return;
    }
    if (num < 0) {
      setError('Solved problems cannot be negative.');
      setSolved(0);
      return;
    }
    if (num > total) {
      setError(`Solved problems (${num}) cannot exceed total problems (${total}).`);
      setSolved(total);
      return;
    }
    setError('');
    setSolved(num);
  };

  const handleTotalChange = (val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) {
      setError('Total problems must be at least 1.');
      setTotal(1);
      return;
    }
    setError('');
    setTotal(num);
    if (solved > num) {
      setSolved(num);
    }
  };

  const stepSolved = (delta) => {
    const next = solved + delta;
    if (next < 0 || next > total) return;
    setError('');
    setSolved(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (solved < 0) {
      setError('Solved problems cannot be negative.');
      return;
    }
    if (solved > total) {
      setError('Solved problems cannot exceed total problems.');
      return;
    }
    if (total <= 0) {
      setError('Total problems must be greater than 0.');
      return;
    }

    onSave({
      ...topicData,
      solved: Number(solved),
      total: Number(total),
      easy: Number(easy),
      medium: Number(medium),
      hard: Number(hard)
    });

    onClose();
  };

  if (!topicData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update: ${topicData.topic}`}
      subtitle="Adjust problem counts and difficulty splits"
      icon={Binary}
      iconColor="text-cyan-400"
      iconBg="bg-cyan-500/10 border-cyan-500/20"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Solved Problems Stepper & Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Problems Solved
            </label>
            <span className="text-xs font-extrabold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
              {calculatedPercent}% Completed
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => stepSolved(-1)}
              disabled={solved <= 0}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min="0"
              max={total}
              value={solved}
              onChange={(e) => handleSolvedChange(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl text-center text-base font-bold bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={() => stepSolved(1)}
              disabled={solved >= total}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Total Target Problems */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Total Target Problems
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            value={total}
            onChange={(e) => handleTotalChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs text-rose-500 font-medium">{error}</p>
        )}

        {/* Optional Difficulty Breakdown */}
        <div className="pt-2 border-t border-slate-200 dark:border-white/10">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Difficulty Distribution (Optional)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[11px] font-semibold text-emerald-400 block mb-1">Easy</span>
              <input
                type="number"
                min="0"
                value={easy}
                onChange={(e) => setEasy(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-2 py-1.5 rounded-lg text-xs font-bold text-center bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-amber-400 block mb-1">Medium</span>
              <input
                type="number"
                min="0"
                value={medium}
                onChange={(e) => setMedium(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-2 py-1.5 rounded-lg text-xs font-bold text-center bg-amber-500/5 border border-amber-500/20 text-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-rose-400 block mb-1">Hard</span>
              <input
                type="number"
                min="0"
                value={hard}
                onChange={(e) => setHard(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-2 py-1.5 rounded-lg text-xs font-bold text-center bg-rose-500/5 border border-rose-500/20 text-rose-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/30 hover:shadow-cyan-600/50 transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Update Progress</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
