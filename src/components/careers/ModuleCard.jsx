import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle2, 
  PlayCircle, 
  BookOpen, 
  FileText, 
  Video, 
  HelpCircle, 
  Briefcase, 
  Terminal, 
  Rocket, 
  ChevronRight 
} from 'lucide-react';

const RESOURCE_ICONS = {
  theory: BookOpen,
  article: BookOpen,
  notes: FileText,
  pdf: FileText,
  video: Video,
  quiz: HelpCircle,
  pyq: Briefcase,
  practice: Terminal,
  project: Rocket
};

export default function ModuleCard({ 
  module, 
  careerSlug, 
  isCompleted = false, 
  completedCount = 0 
}) {
  const resources = module.resources || [];
  const totalResources = resources.length;
  const isPartiallyDone = completedCount > 0 && !isCompleted;

  // Extract unique resource types in this module
  const availableTypes = Array.from(new Set(resources.map(r => r.type)));

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 
      ${isCompleted 
        ? 'bg-emerald-950/20 border-emerald-500/30' 
        : isPartiallyDone 
          ? 'bg-indigo-950/20 border-indigo-500/40 shadow-sm shadow-indigo-500/10' 
          : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          {/* Status Icon */}
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5
            ${isCompleted 
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
              : isPartiallyDone 
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40' 
                : 'bg-white/[0.05] text-slate-400 border border-white/5'}`}>
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <span className="text-xs font-bold">{module.order || 1}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                {module.title}
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-white/[0.04] text-slate-400 border border-white/5">
                {module.difficulty || 'All Levels'}
              </span>
              {isCompleted && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Completed
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 line-clamp-2 mb-2">
              {module.description}
            </p>

            {/* Available Resource Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {availableTypes.map((type) => {
                const Icon = RESOURCE_ICONS[type] || BookOpen;
                return (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-900/60 text-slate-300 border border-white/5 capitalize"
                  >
                    <Icon className="w-2.5 h-2.5 text-indigo-400" />
                    <span>{type}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Action & Stats */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{module.estimatedHours} hrs</span>
            </span>
            {totalResources > 0 && (
              <span className="text-slate-500">
                {completedCount}/{totalResources} lessons
              </span>
            )}
          </div>

          <Link
            to={`/learn/${careerSlug}/${module.slug}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105
              ${isCompleted 
                ? 'bg-white/[0.06] text-slate-200 hover:bg-white/[0.1]' 
                : isPartiallyDone 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20' 
                  : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white'}`}
          >
            <span>{isCompleted ? 'Review' : isPartiallyDone ? 'Resume' : 'Start'}</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
