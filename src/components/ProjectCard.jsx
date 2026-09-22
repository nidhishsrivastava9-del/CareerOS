import React from 'react';
import { motion } from 'framer-motion';
import { FolderGit2, ArrowRight, CheckCircle2, Clock, Pencil, Trash2 } from 'lucide-react';

export default function ProjectCard({ project, onViewDetails, onEdit, onDelete }) {
  const isComplete = project.status === 'Completed';

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="glass-card-interactive p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group"
    >
      <div className="space-y-3">
        {/* Top bar with status and action buttons */}
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-105 transition-transform">
            <FolderGit2 className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border
              ${isComplete 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : project.status === 'Planning'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}
            >
              {isComplete ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              {project.status}
            </span>

            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(project);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Edit Project"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete Project"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Title and description */}
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors">
            {project.title}
          </h4>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Tech stack badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(Array.isArray(project.techStack) ? project.techStack : []).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/[0.06]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Progress bar and Action button */}
      <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/[0.06] space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span>Progress</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{project.progress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/[0.06] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => onViewDetails ? onViewDetails(project) : (project.githubUrl && window.open(project.githubUrl, '_blank'))}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-indigo-400 hover:text-white hover:bg-indigo-600/80 border border-indigo-500/20 hover:border-indigo-500 transition-all duration-200 group/btn"
        >
          <span>View Project</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
