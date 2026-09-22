import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid 
} from 'recharts';
import { Activity, Clock, Flame } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-white/10 shadow-xl text-xs space-y-1">
        <p className="font-bold text-indigo-400">{label}</p>
        <p className="text-slate-200">
          <span className="font-semibold text-white">{payload[0].value}</span> study hours
        </p>
        {payload[0].payload.problemsSolved && (
          <p className="text-[11px] text-slate-400">
            {payload[0].payload.problemsSolved} problems solved
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function ActivityChart({ data = [] }) {
  const { isDark } = useTheme();

  const totalHours = data.reduce((acc, curr) => acc + (curr.hours || 0), 0);
  const avgHours = (totalHours / (data.length || 7)).toFixed(1);

  return (
    <div className="glass-card p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Weekly Activity
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Track study and problem solving consistency
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Total: <strong className="text-slate-900 dark:text-white">{totalHours}h</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Avg: <strong className="text-slate-900 dark:text-white">{avgHours}h/day</strong></span>
          </div>
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="h-60 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} 
            />
            <XAxis 
              dataKey="day" 
              stroke={isDark ? "#94A3B8" : "#64748B"} 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke={isDark ? "#94A3B8" : "#64748B"} 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              unit="h"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="hours" 
              stroke="#6366F1" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#activityGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
