import React, { useState, useEffect } from 'react';
import { Layers, Plus, Check } from 'lucide-react';
import Modal from './Modal';

const CATEGORIES = [
  'Programming',
  'Web Development',
  'Frontend',
  'Backend',
  'Database',
  'DevOps',
  'Core CS',
  'Tools',
  'Other'
];

const LEVELS = [
  'Beginner',
  'Learning',
  'Intermediate',
  'Proficient',
  'Advanced'
];

export default function SkillModal({
  isOpen,
  onClose,
  onSave,
  initialData = null
}) {
  const isEditing = Boolean(initialData && initialData.id);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Frontend');
  const [level, setLevel] = useState(50);
  const [status, setStatus] = useState('Intermediate');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCategory(initialData.category || 'Frontend');
      setLevel(initialData.level ?? 50);
      setStatus(initialData.status || (initialData.level >= 75 ? 'Proficient' : 'Learning'));
      setErrors({});
    } else {
      setName('');
      setCategory('Frontend');
      setLevel(50);
      setStatus('Intermediate');
      setErrors({});
    }
  }, [initialData, isOpen]);

  // Auto-suggest status when level slider moves unless manually changed
  const handleLevelChange = (val) => {
    const num = Math.max(0, Math.min(100, parseInt(val, 10) || 0));
    setLevel(num);
    if (num < 40) setStatus('Learning');
    else if (num < 75) setStatus('Intermediate');
    else if (num < 90) setStatus('Proficient');
    else setStatus('Advanced');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Skill name is required.';
    }

    if (level < 0 || level > 100 || isNaN(level)) {
      newErrors.level = 'Progress must be between 0 and 100.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: initialData?.id || `skill-${Date.now()}`,
      name: name.trim(),
      category,
      level: Number(level),
      status,
      color: initialData?.color || '#6366F1'
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Skill' : 'Add New Skill'}
      subtitle={isEditing ? 'Update your proficiency level and competency assessment' : 'Track a new language, framework, or developer tool'}
      icon={Layers}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Skill Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Skill Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: null });
            }}
            placeholder="e.g. TypeScript, React, Docker, MongoDB"
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-white/[0.04] border ${
              errors.name ? 'border-rose-500' : 'border-slate-300 dark:border-white/10'
            } text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-rose-500 font-medium">{errors.name}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-slate-900 text-white">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Progress Slider and Number Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Proficiency Progress (%)
            </label>
            <span className="text-xs font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
              {level}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="100"
              value={level}
              onChange={(e) => handleLevelChange(e.target.value)}
              className="flex-1 h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={level}
              onChange={(e) => handleLevelChange(e.target.value)}
              className="w-16 px-2 py-1.5 rounded-lg text-center text-xs font-bold bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          {errors.level && (
            <p className="mt-1 text-xs text-rose-500 font-medium">{errors.level}</p>
          )}
        </div>

        {/* Level / Status */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Level / Status
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {LEVELS.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setStatus(lvl)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border text-center ${
                  status === lvl
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-50 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:border-indigo-500/30'
                }`}
              >
                {lvl}
              </button>
            ))}
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
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all"
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
