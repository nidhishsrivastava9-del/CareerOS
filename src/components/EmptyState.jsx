import React from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptyState({
  icon: Icon = Sparkles,
  title = 'No items found',
  description = 'Get started by creating your first entry.',
  actionText,
  onAction,
  iconColor = 'text-indigo-400',
  iconBg = 'bg-indigo-500/10 border-indigo-500/20'
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 sm:p-12 text-center border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center space-y-4 my-6"
    >
      <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-inner ${iconBg} ${iconColor}`}>
        <Icon className="w-7 h-7" />
      </div>

      <div className="max-w-md space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all mt-2"
        >
          <Plus className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </motion.div>
  );
}
