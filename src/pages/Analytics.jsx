import React from 'react';
import { 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Legend 
} from 'recharts';
import { BarChart3, Clock, Binary, Layers, TrendingUp, Sparkles } from 'lucide-react';
import { weeklyActivityData, skillProgressData, dsaSummary } from '../data/dummyData';
import { useTheme } from '../context/ThemeContext';

const dsaPieData = [
  { name: 'Easy', value: dsaSummary.easy, color: '#10B981' },
  { name: 'Medium', value: dsaSummary.medium, color: '#F59E0B' },
  { name: 'Hard', value: dsaSummary.hard, color: '#F43F5E' }
];

const monthlyTrend = [
  { month: 'Nov', hours: 42, milestones: 2 },
  { month: 'Dec', hours: 55, milestones: 3 },
  { month: 'Jan', hours: 68, milestones: 4 },
  { month: 'Feb', hours: 75, milestones: 3 }
];

export default function AnalyticsPage() {
  const { isDark } = useTheme();

  return (
    <div className="space-y-8 pb-10">
      {/* Banner */}
      <div className="glass-card p-6 sm:p-8 border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Telemetry & Insights</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Performance Analytics
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Quantitative metrics evaluating your learning velocity, coding consistency, and algorithmic problem coverage.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
          <div className="text-center">
            <div className="text-2xl font-black text-indigo-400">35.5h</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">This Week</div>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-400">+18%</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">Vs Last Week</div>
          </div>
        </div>
      </div>

      {/* Grid: 4 Analytic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Weekly Study Hours (AreaChart) */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Study Hours Distribution
              </h3>
            </div>
            <span className="text-xs text-slate-400">Past 7 Days</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyActivityData}>
                <defs>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} unit="h" />
                <Tooltip contentStyle={{ backgroundColor: '#111726', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="hours" stroke="#6366F1" strokeWidth={3} fill="url(#hoursGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. DSA Difficulty Breakdown (PieChart) */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Binary className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                DSA Difficulty Distribution
              </h3>
            </div>
            <span className="text-xs text-cyan-400 font-bold">{dsaSummary.totalSolved} Total Solved</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dsaPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dsaPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111726', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Skill Mastery Comparison (BarChart) */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Skill Mastery Levels
              </h3>
            </div>
            <span className="text-xs text-slate-400">Top 6 Core</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillProgressData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#111726', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Bar dataKey="level" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Monthly Velocity & Milestone Output */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Monthly Learning Velocity
              </h3>
            </div>
            <span className="text-xs text-emerald-400 font-bold">Accelerating</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111726', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Legend />
                <Bar dataKey="hours" name="Total Hours" fill="#6366F1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="milestones" name="Milestones Completed" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
