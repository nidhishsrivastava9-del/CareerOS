import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Milestone, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProgressCard({ progressData }) {
  const { percentage = 68, milestonesCompleted = 12, totalMilestones = 18, statusMessage } = progressData;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-6 sm:p-8 relative overflow-hidden border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
        {/* Left Content */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Readiness Benchmark</span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Career Progress
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 max-w-xl">
              {statusMessage || "You're making great progress toward your career goals."}
            </p>
          </div>

          {/* Progress bar visualizer */}
          <div className="space-y-2 max-w-md mx-auto md:mx-0">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {milestonesCompleted} of {totalMilestones} milestones completed
              </span>
              <span className="text-indigo-400 font-bold">{percentage}%</span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-white/[0.06] p-0.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-glow-brand"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4">
            <Link
              to="/roadmap"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all group"
            >
              <span>View Full Roadmap</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Milestone className="w-3.5 h-3.5 text-indigo-400" />
              Next: React State Architecture
            </span>
          </div>
        </div>

        {/* Right Circular Gauge */}
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <svg className="w-36 h-36 sm:w-40 sm:h-40 -rotate-90 transform" viewBox="0 0 140 140">
            {/* Background Circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              className="text-slate-200 dark:text-white/[0.06]"
              fill="transparent"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="70"
              cy="70"
              r={radius}
              stroke="url(#gradient-progress)"
              strokeWidth="10"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              strokeLinecap="round"
              fill="transparent"
            />
            <defs>
              <linearGradient id="gradient-progress" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="50%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>

          {/* Central Percentage Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {percentage}%
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Completed
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
