import React from 'react';
import { motion } from 'framer-motion';

export default function SkillCard({ skill, index = 0 }) {
  return (
    <div className="space-y-1.5 py-1">
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 dark:text-slate-200">{skill.name}</span>
          {skill.status && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-white/[0.05] text-slate-400 border border-white/5">
              {skill.status}
            </span>
          )}
        </div>
        <span className="font-bold text-slate-700 dark:text-slate-300">{skill.level}%</span>
      </div>

      <div className="h-2 sm:h-2.5 w-full bg-slate-200 dark:bg-white/[0.06] rounded-full overflow-hidden p-[1px]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${skill.level}%` }}
          transition={{ duration: 0.8, delay: index * 0.05, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
          style={{ backgroundColor: skill.color || '#6366F1' }}
        />
      </div>
    </div>
  );
}
