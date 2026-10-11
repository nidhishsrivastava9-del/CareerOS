import React, { useState, useEffect } from 'react';
import { Target, Plus, Check } from 'lucide-react';
import Modal from './Modal';

const CATEGORIES = ['Daily', 'Short-Term', 'Long-Term', 'DSA', 'Projects', 'Learning', 'Academics'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export default function GoalModal({
  isOpen,
  onClose,
  onSave,
  initialData = null
}) {
  const isEditing = Boolean(initialData && initialData.id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Daily');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [completed, setCompleted] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || initialData.task || '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || 'Daily');
      setDeadline(initialData.deadline || '');
      setPriority(initialData.priority || 'Medium');
      setCompleted(Boolean(initialData.completed || initialData.status === 'Completed'));
      setErrors({});
    } else {
      setTitle('');
      setDescription('');
      setCategory('Daily');
      setDeadline('Today, 8:00 PM');
      setPriority('Medium');
      setCompleted(false);
      setErrors({});
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Goal title is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: initialData?.id || `goal-${Date.now()}`,
      title: title.trim(),
      task: title.trim(),
      description: description.trim(),
      category,
      deadline: deadline.trim() || 'No deadline',
      priority,
      completed,
      progress: completed ? 100 : (initialData?.progress ?? 0),
      status: completed ? 'Completed' : 'In Progress'
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Goal' : 'Add New Goal'}
      subtitle={isEditing ? 'Update milestone target and timeline' : 'Define a concrete objective to maintain career momentum'}
      icon={Target}
      iconColor="text-cyan-400"
      iconBg="bg-cyan-500/10 border-cyan-500/20"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Goal Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors({ ...errors, title: null });
            }}
            placeholder="e.g. Solve 5 Graph problems, Ship Auth module"
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-white/[0.04] border ${
              errors.title ? 'border-rose-500' : 'border-slate-300 dark:border-white/10'
            } text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors`}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-rose-500 font-medium">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Description / Notes (optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add relevant context, steps, or study links..."
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Category & Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Target Deadline
            </label>
            <input
              type="text"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="e.g. Tomorrow, Friday, Oct 15"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Priority Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRIORITIES.map((p) => {
              const active = priority === p;
              const colorClasses = {
                Low: active ? 'bg-blue-600 text-white border-blue-500 shadow-blue-600/30' : 'hover:border-blue-500/30 text-blue-400',
                Medium: active ? 'bg-amber-600 text-white border-amber-500 shadow-amber-600/30' : 'hover:border-amber-500/30 text-amber-400',
                High: active ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30' : 'hover:border-rose-500/30 text-rose-400'
              };

              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border text-center ${
                    active
                      ? colorClasses[p]
                      : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/5 ' + colorClasses[p]
                  }`}
                >
                  {p} Priority
                </button>
              );
            })}
          </div>
        </div>

        {/* Completed checkbox toggle */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5">
          <input
            type="checkbox"
            id="goal-completed-check"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
            className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-slate-800"
          />
          <label htmlFor="goal-completed-check" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            Mark as Completed immediately
          </label>
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
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Goal</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add Goal</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
