import React from 'react';
import { Clock, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import RoadmapSubject from './RoadmapSubject';

export default function RoadmapPhase({ 
  phase, 
  careerSlug, 
  completedLessonIds = [], 
  completedModuleSlugs = [] 
}) {
  const subjects = phase.subjects || [];

  return (
    <div className="relative pl-6 sm:pl-8 border-l-2 border-indigo-500/30 space-y-5 pb-8 last:pb-0">
      {/* Timeline Node Icon */}
      <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-[#0B0F19] border-2 border-indigo-500 flex items-center justify-center text-xs font-bold text-indigo-400 shadow-glow-brand">
        {phase.phaseNumber}
      </div>

      {/* Phase Banner */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Phase {phase.phaseNumber}
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{phase.estimatedHours} hrs</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>{subjects.length} Subjects</span>
            </span>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          {phase.title}
        </h2>

        {phase.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
            {phase.description}
          </p>
        )}
      </div>

      {/* Subjects Tree */}
      <div className="space-y-4 pt-2">
        {subjects.map((subject) => (
          <RoadmapSubject
            key={subject.id}
            subject={subject}
            careerSlug={careerSlug}
            completedLessonIds={completedLessonIds}
            completedModuleSlugs={completedModuleSlugs}
          />
        ))}
      </div>
    </div>
  );
}
