import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Map, 
  Layers, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  Code, 
  Terminal, 
  Cpu, 
  Shield, 
  Cloud, 
  Database, 
  Smartphone, 
  Workflow, 
  Radio, 
  Boxes, 
  Gamepad2, 
  Palette, 
  CheckSquare, 
  Activity, 
  PieChart, 
  LineChart 
} from 'lucide-react';
import ProgressIndicator from './ProgressIndicator';

const ICON_MAP = {
  Code,
  Terminal,
  Cpu,
  Shield,
  Cloud,
  Database,
  Smartphone,
  Workflow,
  Radio,
  Boxes,
  Gamepad2,
  Palette,
  CheckSquare,
  Activity,
  PieChart,
  LineChart,
  Layers,
  Sparkles
};

export default function CareerCard({ career, progress = 0 }) {
  const IconComponent = ICON_MAP[career.icon] || Code;
  const isStarted = progress > 0;
  const isCompleted = progress >= 100;

  return (
    <div className="glass-card flex flex-col justify-between p-6 transition-all duration-300 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 group relative overflow-hidden">
      {/* Top ambient glow highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10 group-hover:bg-indigo-500/20 transition-all duration-300" />

      <div>
        {/* Category & Status Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/[0.04] text-indigo-300 border border-white/5">
            {career.category}
          </span>

          {career.status && (
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border
              ${career.status === 'Trending' 
                ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' 
                : career.status === 'Popular' 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
              {career.status}
            </span>
          )}
        </div>

        {/* Title & Icon */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 group-hover:scale-105 group-hover:text-white group-hover:border-indigo-500/60 transition-all">
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors leading-snug">
              {career.title}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{career.estimatedHours} hrs</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span>{career.difficulty}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
          {career.description}
        </p>

        {/* Key Skills Pills */}
        <div className="mb-5">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">
            Skills to Master
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(career.skills || []).slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-white/5"
              >
                {skill}
              </span>
            ))}
            {(career.skills || []).length > 4 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md text-slate-400 bg-white/[0.02]">
                +{career.skills.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Progress & Actions */}
      <div className="pt-4 border-t border-white/5 space-y-4">
        {/* Progress bar if started */}
        {isStarted && (
          <div className="space-y-1">
            <ProgressIndicator
              percent={progress}
              size="sm"
              label={isCompleted ? 'Completed' : 'Learning Progress'}
              color={isCompleted ? 'emerald' : 'indigo'}
            />
          </div>
        )}

        {/* Roadmap info & Action buttons */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Map className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {career.phaseCount || 4} Phases
              {career.moduleCount ? ` • ${career.moduleCount} Modules` : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/careers/${career.slug}`}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-all"
            >
              Overview
            </Link>

            <Link
              to={`/careers/${career.slug}/roadmap`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
            >
              <span>{isStarted ? 'Resume' : 'Roadmap'}</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
