import React from 'react';

export default function ProgressIndicator({
  percent = 0,
  size = 'md', // 'sm' | 'md' | 'lg'
  showText = true,
  label = '',
  color = 'indigo'
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5'
  };

  const colorGradients = {
    indigo: 'from-indigo-500 via-purple-500 to-pink-500',
    emerald: 'from-emerald-500 to-teal-400',
    cyan: 'from-cyan-500 to-blue-500',
    amber: 'from-amber-500 to-orange-500'
  };

  const gradient = colorGradients[color] || colorGradients.indigo;

  return (
    <div className="w-full space-y-1.5">
      {showText && (
        <div className="flex items-center justify-between text-xs">
          {label && (
            <span className="font-medium text-slate-400 truncate mr-2">
              {label}
            </span>
          )}
          <span className="font-bold text-slate-200 ml-auto tabular-nums">
            {clamped}%
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-white/5`}>
        <div
          className={`${heightClasses[size] || 'h-2.5'} rounded-full bg-gradient-to-r ${gradient} transition-all duration-500 ease-out shadow-sm`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
