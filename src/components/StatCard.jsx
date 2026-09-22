import React from 'react';
import { Code, FolderGit2, Binary, FileCheck2, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap = {
  Code,
  FolderGit2,
  Binary,
  FileCheck2
};

const colorStyles = {
  indigo: {
    bg: 'from-indigo-500/10 to-indigo-500/5',
    border: 'hover:border-indigo-500/40',
    iconBg: 'bg-indigo-500/20 text-indigo-400 ring-indigo-500/30',
    badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
  },
  purple: {
    bg: 'from-purple-500/10 to-purple-500/5',
    border: 'hover:border-purple-500/40',
    iconBg: 'bg-purple-500/20 text-purple-400 ring-purple-500/30',
    badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20'
  },
  cyan: {
    bg: 'from-cyan-500/10 to-cyan-500/5',
    border: 'hover:border-cyan-500/40',
    iconBg: 'bg-cyan-500/20 text-cyan-400 ring-cyan-500/30',
    badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
  },
  emerald: {
    bg: 'from-emerald-500/10 to-emerald-500/5',
    border: 'hover:border-emerald-500/40',
    iconBg: 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30',
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
  }
};

export default function StatCard({ item, index = 0 }) {
  const Icon = iconMap[item.iconName] || Code;
  const style = colorStyles[item.accentColor] || colorStyles.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`glass-card p-5 sm:p-6 relative overflow-hidden transition-all duration-300 ${style.border} group`}
    >
      {/* Background soft ambient gradient */}
      <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-gradient-to-br ${style.bg} blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500`} />

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            {item.title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {item.value}
            </span>
          </div>
        </div>

        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ring-1 ${style.iconBg} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/[0.05] flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${style.badge}`}>
          <ArrowUpRight className="w-3 h-3" />
          {item.badge}
        </span>
        <span className="text-[11px] text-slate-400 dark:text-slate-400 truncate max-w-[130px]">
          {item.subtitle}
        </span>
      </div>
    </motion.div>
  );
}
