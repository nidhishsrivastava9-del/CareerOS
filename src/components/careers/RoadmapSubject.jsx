import React, { useState } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  Clock, 
  Layers, 
  Code, 
  Terminal, 
  Database, 
  Cloud, 
  Server, 
  Binary, 
  Palette, 
  Smartphone, 
  Network, 
  ShieldAlert, 
  PlayCircle, 
  BarChart, 
  CheckCircle2, 
  Play 
} from 'lucide-react';
import ModuleCard from './ModuleCard';
import ProgressIndicator from './ProgressIndicator';

const ICON_MAP = {
  BookOpen,
  Code,
  Terminal,
  Database,
  Cloud,
  Server,
  Binary,
  Palette,
  Smartphone,
  Network,
  ShieldAlert,
  PlayCircle,
  BarChart,
  Layers,
  Play
};

export default function RoadmapSubject({ 
  subject, 
  careerSlug, 
  completedLessonIds = [], 
  completedModuleSlugs = [] 
}) {
  const [isOpen, setIsOpen] = useState(true);
  const Icon = ICON_MAP[subject.icon] || BookOpen;
  const modules = subject.modules || [];

  // Calculate subject completion
  let totalResources = 0;
  let finishedResources = 0;
  let finishedModulesCount = 0;

  modules.forEach(m => {
    const isModDone = completedModuleSlugs.includes(m.slug);
    if (isModDone) finishedModulesCount++;

    (m.resources || []).forEach(r => {
      totalResources++;
      if (completedLessonIds.includes(String(r.id))) {
        finishedResources++;
      }
    });
  });

  const percent = totalResources > 0 
    ? Math.round((finishedResources / totalResources) * 100) 
    : (modules.length > 0 ? Math.round((finishedModulesCount / modules.length) * 100) : 0);

  return (
    <div className="glass-card overflow-hidden border-white/[0.08] transition-all">
      {/* Subject Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors select-none"
      >
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-100 truncate">
                {subject.title}
              </h3>
              <span className="text-[11px] text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/5">
                {modules.length} {modules.length === 1 ? 'Module' : 'Modules'}
              </span>
            </div>

            {subject.description && (
              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                {subject.description}
              </p>
            )}
          </div>
        </div>

        {/* Right Details */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden md:flex flex-col items-end w-28">
            <ProgressIndicator percent={percent} size="sm" showText={true} />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{subject.estimatedHours}h</span>
          </div>

          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Modules List */}
      {isOpen && (
        <div className="px-5 pb-5 pt-1 space-y-3 border-t border-white/5 bg-black/10">
          {modules.map((module) => {
            const isModCompleted = completedModuleSlugs.includes(module.slug);
            const modCompletedCount = (module.resources || []).filter(r => 
              completedLessonIds.includes(String(r.id))
            ).length;

            return (
              <ModuleCard
                key={module.id || module.slug}
                module={module}
                careerSlug={careerSlug}
                isCompleted={isModCompleted || (module.resources?.length > 0 && modCompletedCount === module.resources.length)}
                completedCount={modCompletedCount}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
