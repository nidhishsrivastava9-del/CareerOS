import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Lock, PlayCircle, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Roadmap({ milestones = [], targetRole = "Software Developer", isCompact = false }) {
  const displayMilestones = isCompact ? milestones.slice(0, 9) : milestones;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Your Career Roadmap
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-indigo-300 font-medium">
            Target Track: {targetRole}
          </p>
        </div>
        {isCompact && (
          <Link
            to="/roadmap"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
          >
            <span>View Full Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Interactive Milestones List / Timeline */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-[2px] before:bg-slate-200 dark:before:bg-white/[0.08]">
        {displayMilestones.map((item, index) => {
          const isCompleted = item.status === 'completed';
          const isCurrent = item.status === 'current';
          const isUpcoming = item.status === 'upcoming';

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`relative flex items-start justify-between p-3 rounded-xl transition-all duration-200 
                ${isCurrent 
                  ? 'bg-indigo-500/10 border border-indigo-500/30 shadow-sm shadow-indigo-500/10' 
                  : 'bg-white/[0.02] border border-transparent hover:border-white/5 hover:bg-white/[0.04]'}`}
            >
              {/* Node Indicator */}
              <div 
                className={`absolute -left-[30px] top-3.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-[#090D16] 
                  ${isCompleted 
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/50' 
                    : isCurrent 
                    ? 'bg-indigo-500 text-white animate-pulse shadow-sm shadow-indigo-500/50' 
                    : 'bg-slate-700 text-slate-400'}`}
              >
                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                {isCurrent && <PlayCircle className="w-3.5 h-3.5" />}
                {isUpcoming && <Lock className="w-2.5 h-2.5 text-slate-400" />}
              </div>

              {/* Milestone Details */}
              <div className="flex-1 pr-3">
                <div className="flex items-center gap-2">
                  <h4 className={`text-sm font-semibold ${isCompleted ? 'text-slate-200' : isCurrent ? 'text-indigo-400' : 'text-slate-400'}`}>
                    {item.title}
                  </h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider
                    ${isCompleted 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : isCurrent 
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                      : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                    {item.status}
                  </span>
                </div>
                {!isCompact && (
                  <p className="mt-1 text-xs text-slate-400">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Time indicator */}
              <div className="text-right flex-shrink-0">
                <span className="text-[11px] font-medium text-slate-500">
                  {item.hours}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
