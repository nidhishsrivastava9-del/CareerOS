import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Map, 
  CheckCircle2, 
  PlayCircle, 
  Lock, 
  Calendar, 
  Clock, 
  BookOpen, 
  ExternalLink, 
  Filter, 
  Sparkles, 
  ChevronRight, 
  Compass 
} from 'lucide-react';
import { getRoadmap, saveRoadmap, getUser, subscribeToStorage, STORAGE_KEYS } from '../utils/storage';
import { useToast } from '../context/ToastContext';

export default function RoadmapPage() {
  const { showToast } = useToast();
  const [milestones, setMilestones] = useState(() => getRoadmap());
  const [userProfile, setUserProfile] = useState(() => getUser());
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const unsubscribe = subscribeToStorage((key, data) => {
      if (key === STORAGE_KEYS.ROADMAP && Array.isArray(data)) {
        setMilestones(data);
      }
      if (key === STORAGE_KEYS.USER && data) {
        setUserProfile(data);
      }
    });
    return unsubscribe;
  }, []);

  const handleCycleStatus = (id) => {
    const STATUS_FLOW = {
      upcoming: 'current',
      current: 'completed',
      completed: 'upcoming'
    };

    const updated = milestones.map((m) => {
      if (m.id === id) {
        const nextStatus = STATUS_FLOW[m.status] || 'current';
        const nextDate = nextStatus === 'completed' 
          ? 'Completed' 
          : nextStatus === 'current' 
            ? 'Active Now' 
            : 'Planned';
        return {
          ...m,
          status: nextStatus,
          completedDate: nextDate
        };
      }
      return m;
    });

    setMilestones(updated);
    saveRoadmap(updated);
    const target = updated.find(m => m.id === id);
    if (target) {
      showToast(`Milestone "${target.title}" set to ${target.status}!`, target.status === 'completed' ? 'success' : 'info');
    }
  };

  const filteredMilestones = milestones.filter((m) => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const currentCount = milestones.filter(m => m.status === 'current').length;
  const upcomingCount = milestones.filter(m => m.status === 'upcoming').length;

  return (
    <div className="space-y-8 pb-10">
      {/* Top Banner */}
      <div className="glass-card p-6 sm:p-8 border-indigo-500/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Map className="w-3.5 h-3.5" />
              <span>Full Stack Curriculum</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Software Developer Roadmap
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              An industry-aligned sequence of milestones designed to transform your theoretical computer science foundations into verified engineering capability.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
            <div className="text-center">
              <div className="text-xl font-extrabold text-emerald-400">{completedCount}</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Done</div>
            </div>
            <div className="w-[1px] h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-xl font-extrabold text-indigo-400">{currentCount}</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Active</div>
            </div>
            <div className="w-[1px] h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-xl font-extrabold text-slate-400">{upcomingCount}</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Queued</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Multi-Career Bridge */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {['all', 'completed', 'current', 'upcoming'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all
                  ${filter === tab 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                    : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'}`}
              >
                {tab} ({tab === 'all' ? milestones.length : milestones.filter(m => m.status === tab).length})
              </button>
            ))}
          </div>

          <Link
            to="/careers"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 border border-indigo-500/20 transition-all self-start sm:self-auto"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore All 23 Career Catalogs</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Detailed Milestone Cards List */}
      <div className="space-y-4">
        {filteredMilestones.map((milestone, idx) => {
          const isDone = milestone.status === 'completed';
          const isActive = milestone.status === 'current';

          return (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`glass-card p-5 sm:p-6 transition-all duration-200 
                ${isActive ? 'border-indigo-500/50 shadow-glow-brand' : 'hover:border-white/15'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => handleCycleStatus(milestone.id)}
                    title="Click to change status (Upcoming -> Current -> Completed)"
                    className={`mt-1 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105
                    ${isDone ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      isActive ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 animate-pulse' : 
                      'bg-white/[0.05] text-slate-500'}`}
                  >
                    {isDone && <CheckCircle2 className="w-4 h-4" />}
                    {isActive && <PlayCircle className="w-4 h-4" />}
                    {!isDone && !isActive && <Lock className="w-3.5 h-3.5" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {milestone.title}
                      </h3>
                      <span className="text-[11px] px-2 py-0.5 rounded-md font-medium text-slate-400 bg-white/[0.04] border border-white/5">
                        {milestone.phase}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCycleStatus(milestone.id)}
                        title="Click to toggle status"
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider transition-all hover:scale-105 cursor-pointer
                        ${isDone ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          isActive ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 
                          'bg-slate-800 text-slate-400 border border-white/5'}`}
                      >
                        {milestone.status}
                      </button>
                    </div>

                    <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-3xl">
                      {milestone.description}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{milestone.hours}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {milestone.completedDate}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
