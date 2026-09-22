import React, { useState, useEffect } from 'react';
import { FolderGit2, Plus, Check } from 'lucide-react';
import Modal from './Modal';

const STATUS_OPTIONS = ['Planning', 'In Progress', 'Completed'];

export default function ProjectModal({
  isOpen,
  onClose,
  onSave,
  initialData = null
}) {
  const isEditing = Boolean(initialData && initialData.id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [status, setStatus] = useState('In Progress');
  const [progress, setProgress] = useState(30);
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setTechStackInput(
        Array.isArray(initialData.techStack)
          ? initialData.techStack.join(', ')
          : (initialData.techStack || '')
      );
      setStatus(initialData.status || 'In Progress');
      setProgress(initialData.progress ?? 30);
      setGithubUrl(initialData.githubUrl || '');
      setDemoUrl(initialData.demoUrl || '');
      setErrors({});
    } else {
      setTitle('');
      setDescription('');
      setTechStackInput('React, JavaScript, Tailwind CSS');
      setStatus('In Progress');
      setProgress(30);
      setGithubUrl('https://github.com');
      setDemoUrl('');
      setErrors({});
    }
  }, [initialData, isOpen]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if (newStatus === 'Completed' && progress < 100) {
      setProgress(100);
    } else if (newStatus === 'Planning' && progress > 30) {
      setProgress(15);
    }
  };

  const handleProgressChange = (val) => {
    const num = Math.max(0, Math.min(100, parseInt(val, 10) || 0));
    setProgress(num);
    if (num === 100 && status !== 'Completed') {
      setStatus('Completed');
    } else if (num < 100 && status === 'Completed') {
      setStatus('In Progress');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Project name is required.';
    }

    if (progress < 0 || progress > 100 || isNaN(progress)) {
      newErrors.progress = 'Progress must be between 0 and 100.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const techArray = techStackInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      id: initialData?.id || `proj-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Interactive software project with production-grade architecture.',
      techStack: techArray.length > 0 ? techArray : ['React', 'JavaScript'],
      status,
      progress: Number(progress),
      githubUrl: githubUrl.trim() || 'https://github.com',
      demoUrl: demoUrl.trim(),
      featured: initialData?.featured ?? false
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Project' : 'Add New Project'}
      subtitle={isEditing ? 'Modify project specification, stack and progress' : 'Showcase your software engineering work'}
      icon={FolderGit2}
      iconColor="text-purple-400"
      iconBg="bg-purple-500/10 border-purple-500/20"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Project Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors({ ...errors, title: null });
            }}
            placeholder="e.g. Distributed Task Queue, AI Code Reviewer"
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-white/[0.04] border ${
              errors.title ? 'border-rose-500' : 'border-slate-300 dark:border-white/10'
            } text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors`}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-rose-500 font-medium">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key features, architecture, and engineering problems solved..."
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Tech Stack */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Tech Stack (comma separated)
          </label>
          <input
            type="text"
            value={techStackInput}
            onChange={(e) => setTechStackInput(e.target.value)}
            placeholder="React, Node.js, PostgreSQL, Redis"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Status Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            {STATUS_OPTIONS.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleStatusChange(st)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border text-center ${
                  status === st
                    ? 'bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-600/30'
                    : 'bg-slate-50 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:border-purple-500/30'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Progress % */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Completion Progress (%)
            </label>
            <span className="text-xs font-extrabold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
              {progress}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => handleProgressChange(e.target.value)}
              className="flex-1 h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => handleProgressChange(e.target.value)}
              className="w-16 px-2 py-1.5 rounded-lg text-center text-xs font-bold bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          {errors.progress && (
            <p className="mt-1 text-xs text-rose-500 font-medium">{errors.progress}</p>
          )}
        </div>

        {/* GitHub Link & Demo URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              GitHub Repository
            </label>
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Live Demo URL (optional)
            </label>
            <input
              type="text"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://app.demo..."
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
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
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/30 hover:shadow-purple-600/50 transition-all"
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
