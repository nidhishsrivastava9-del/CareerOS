import React, { useState, useEffect } from 'react';
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
import { BarChart3, Clock, Binary, Layers, TrendingUp, Sparkles, Brain, Award, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import api from '../utils/api';
import { getActivity, getDSA, getSkills, saveDSA, saveSkills, subscribeToStorage, STORAGE_KEYS } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';

const monthlyTrend = [
  { month: 'Nov', hours: 42, milestones: 2 },
  { month: 'Dec', hours: 55, milestones: 3 },
  { month: 'Jan', hours: 68, milestones: 4 },
  { month: 'Feb', hours: 75, milestones: 3 }
];

export default function AnalyticsPage() {
  const { isDark } = useTheme();
  const [activity, setActivity] = useState(() => getActivity());
  const [dsaData, setDsaData] = useState(() => getDSA());
  const [skills, setSkills] = useState(() => getSkills());
  const [assessmentDiagnostics, setAssessmentDiagnostics] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);

  useEffect(() => {
    // Initial server fetch
    const loadServerMetrics = async () => {
      try {
        const [skillsRes, dsaRes, diagRes, attemptsRes] = await Promise.all([
          api.skills.getAll(),
          api.dsa.getAll(),
          api.assessments.getDiagnostics(),
          api.assessments.getAttempts({ limit: 6 })
        ]);
        if (skillsRes && skillsRes.success && Array.isArray(skillsRes.data)) {
          setSkills(skillsRes.data);
          saveSkills(skillsRes.data);
        }
        if (diagRes && diagRes.success && diagRes.diagnostics) {
          setAssessmentDiagnostics(diagRes.diagnostics);
        }
        if (attemptsRes && attemptsRes.success && Array.isArray(attemptsRes.attempts)) {
          setRecentAttempts(attemptsRes.attempts);
        }
        if (dsaRes && dsaRes.success && Array.isArray(dsaRes.data)) {
          const topics = dsaRes.data;
          const totalSolved = topics.reduce((acc, t) => acc + (Number(t.solved) || 0), 0);
          const targetGoal = topics.reduce((acc, t) => acc + (Number(t.total) || 0), 0);
          const formatted = {
            topics,
            summary: {
              totalSolved,
              targetGoal,
              ...(dsaRes.summary || {})
            }
          };
          setDsaData(formatted);
          saveDSA(formatted);
        }
      } catch (err) {
        console.warn('[Analytics] Failed to fetch server analytics:', err);
      }
    };

    loadServerMetrics();

    const unsubscribe = subscribeToStorage((key, data) => {
      if (key === STORAGE_KEYS.ACTIVITY && Array.isArray(data)) setActivity(data);
      if (key === STORAGE_KEYS.DSA && data) setDsaData(data);
      if (key === STORAGE_KEYS.SKILLS && Array.isArray(data)) setSkills(data);
    });
    return unsubscribe;
  }, []);

  const totalHours = activity.reduce((acc, curr) => acc + (curr.hours || 0), 0);
  const topics = dsaData.topics || [];
  const totalSolved = topics.reduce((acc, t) => acc + (Number(t.solved) || 0), 0);
  const easyCount = topics.reduce((acc, t) => acc + (Number(t.easy) || 0), 0);
  const mediumCount = topics.reduce((acc, t) => acc + (Number(t.medium) || 0), 0);
  const hardCount = topics.reduce((acc, t) => acc + (Number(t.hard) || 0), 0);

  const dsaPieData = [
    { name: 'Easy', value: easyCount || 1, color: '#10B981' },
    { name: 'Medium', value: mediumCount || 1, color: '#F59E0B' },
    { name: 'Hard', value: hardCount || 1, color: '#F43F5E' }
  ];

  const topSkills = skills.slice(0, 6);

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
            <div className="text-2xl font-black text-indigo-400">{totalHours.toFixed(1)}h</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">This Week</div>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-400">{totalSolved}</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">Problems Solved</div>
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
              <AreaChart data={activity}>
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
            <span className="text-xs text-cyan-400 font-bold">{totalSolved} Total Solved</span>
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
              <BarChart data={topSkills}>
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

      {/* 5. Day 11 Assessment & Adaptive Learning Engine Telemetry */}
      <div className="glass-card p-6 sm:p-8 border-indigo-500/20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Assessment & Adaptive Learning Telemetry</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Day 11 Engine
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Authoritative evaluation metrics, mastery recalibration, and topic diagnostics.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400">Total Attempts: </span>
              <span className="font-bold text-indigo-400">{assessmentDiagnostics?.totalAttempts || recentAttempts.length || 0}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400">Average Score: </span>
              <span className="font-bold text-emerald-400">{assessmentDiagnostics?.averageScore || 0}%</span>
            </div>
          </div>
        </div>

        {/* Diagnostics Grid: Strong vs Declining Topics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strong Topics */}
          <div className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-500/20 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Demonstrated High Mastery Topics</span>
            </div>
            {assessmentDiagnostics?.strongTopics && assessmentDiagnostics.strongTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {assessmentDiagnostics.strongTopics.map((topic, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium capitalize">
                    ✓ {topic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No strong topics recorded yet. Complete assessments to calibrate mastery.</p>
            )}
          </div>

          {/* Weak / Declining Topics */}
          <div className="p-4 rounded-xl bg-amber-950/15 border border-amber-500/20 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <XCircle className="w-4 h-4" />
              <span>Topics Identified for Remediation</span>
            </div>
            {assessmentDiagnostics?.decliningTopics && assessmentDiagnostics.decliningTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {assessmentDiagnostics.decliningTopics.map((topic, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-medium capitalize">
                    ⚠ {topic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No declining topics detected. All evaluated competencies meet passing thresholds.</p>
            )}
          </div>
        </div>

        {/* Recent Attempts Table */}
        {recentAttempts && recentAttempts.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Recent Authoritative Attempts</span>
            </h4>
            <div className="space-y-2">
              {recentAttempts.map((att, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                      att.passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {att.passed ? 'Passed' : 'Needs Review'}
                    </span>
                    <span className="font-semibold text-slate-200">
                      Score: {att.score}/{att.totalQuestions} ({att.percentage}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                    <span>{Math.round((att.timeTakenSeconds || att.timeTaken || 0) / 60)}m {((att.timeTakenSeconds || att.timeTaken || 0) % 60)}s</span>
                    <span>{new Date(att.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
