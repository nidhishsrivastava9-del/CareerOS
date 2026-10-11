import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Plus, 
  Code2, 
  Layers, 
  Target, 
  MapPin, 
  Compass, 
  TrendingUp,
  FolderPlus,
  Binary,
  Loader2,
  AlertCircle,
  RefreshCw,
  Database,
  Brain,
  Award
} from 'lucide-react';
import { studentProfile as defaultStudentProfile } from '../data/dummyData';
import api from '../utils/api';
import { 
  getSkills, 
  saveSkills, 
  getProjects, 
  saveProjects, 
  getGoals, 
  saveGoals, 
  getDSA, 
  saveDSA, 
  getUser, 
  getActivity,
  getRoadmap,
  getResume,
  subscribeToStorage, 
  STORAGE_KEYS 
} from '../utils/storage';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

import StatCard from '../components/StatCard';
import ProgressCard from '../components/ProgressCard';
import SkillCard from '../components/SkillCard';
import Roadmap from '../components/Roadmap';
import ProjectCard from '../components/ProjectCard';
import GoalCard from '../components/GoalCard';
import ActivityChart from '../components/ActivityChart';

import SkillModal from '../components/SkillModal';
import ProjectModal from '../components/ProjectModal';
import GoalModal from '../components/GoalModal';
import DSAModal from '../components/DSAModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  // Database-backed state
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [goals, setGoals] = useState([]);
  const [dsaData, setDsaData] = useState({ topics: [], summary: {} });
  const [userProfile, setUserProfile] = useState(() => getUser() || defaultStudentProfile);
  const [activityData, setActivityData] = useState(() => getActivity());
  const [roadmapMilestones, setRoadmapMilestones] = useState(() => getRoadmap());
  const [resumeInfo, setResumeInfo] = useState(() => getResume());
  const [assessmentDiagnostics, setAssessmentDiagnostics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Modal controls for functional Quick Actions
  const [activeModal, setActiveModal] = useState(null); // 'skill' | 'project' | 'goal' | 'dsa'
  const [selectedDsaTopic, setSelectedDsaTopic] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [skillsRes, projectsRes, goalsRes, dsaRes, meRes, diagRes] = await Promise.all([
        api.skills.getAll(),
        api.projects.getAll(),
        api.goals.getAll(),
        api.dsa.getAll(),
        api.auth.getMe(),
        api.assessments.getDiagnostics()
      ]);

      if (skillsRes && skillsRes.success && Array.isArray(skillsRes.data)) {
        setSkills(skillsRes.data);
        saveSkills(skillsRes.data);
      }
      if (projectsRes && projectsRes.success && Array.isArray(projectsRes.data)) {
        setProjects(projectsRes.data);
        saveProjects(projectsRes.data);
      }
      if (goalsRes && goalsRes.success && Array.isArray(goalsRes.data)) {
        setGoals(goalsRes.data);
        saveGoals(goalsRes.data);
      }
      if (dsaRes && dsaRes.success && Array.isArray(dsaRes.data)) {
        const topics = dsaRes.data;
        const totalSolved = topics.reduce((acc, t) => acc + (Number(t.solved) || 0), 0);
        const targetGoal = topics.reduce((acc, t) => acc + (Number(t.total) || 0), 0);
        const dsaPayload = {
          topics,
          summary: {
            totalSolved,
            targetGoal,
            ...(dsaRes.summary || {})
          }
        };
        setDsaData(dsaPayload);
        saveDSA(dsaPayload);
      }
      if (meRes && meRes.success && meRes.data) {
        setUserProfile(prev => ({
          ...prev,
          name: meRes.data.name,
          email: meRes.data.email,
          id: meRes.data._id || meRes.data.id
        }));
      }
      if (diagRes && diagRes.success && diagRes.diagnostics) {
        setAssessmentDiagnostics(diagRes.diagnostics);
      }
    } catch (err) {
      console.warn('[Dashboard] Fetch data notice:', err.message);
      setError(err.message || 'Error loading dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Subscribe to storage updates from other pages
  useEffect(() => {
    const unsubscribe = subscribeToStorage((key, data) => {
      if (key === STORAGE_KEYS.SKILLS && Array.isArray(data)) setSkills(data);
      if (key === STORAGE_KEYS.PROJECTS && Array.isArray(data)) setProjects(data);
      if (key === STORAGE_KEYS.GOALS && Array.isArray(data)) setGoals(data);
      if (key === STORAGE_KEYS.DSA && data) setDsaData(data);
      if (key === STORAGE_KEYS.USER && data) setUserProfile(data);
      if (key === STORAGE_KEYS.ACTIVITY && Array.isArray(data)) setActivityData(data);
      if (key === STORAGE_KEYS.ROADMAP && Array.isArray(data)) setRoadmapMilestones(data);
      if (key === STORAGE_KEYS.RESUME && data) setResumeInfo(data);
    });
    return unsubscribe;
  }, []);

  /* =========================================================================
     DYNAMIC STATISTICS & CAREER PROGRESS CALCULATION
     ========================================================================= */

  // 1. Skills Metrics
  const skillsCount = skills.length;
  const proficientSkillsCount = skills.filter((s) => (Number(s.level || s.progress) || 0) >= 75).length;
  const skillsAvg = skillsCount > 0 
    ? Math.round(skills.reduce((acc, s) => acc + (Number(s.level || s.progress) || 0), 0) / skillsCount) 
    : 0;

  // 2. Projects Metrics
  const projectsCount = projects.length;
  const completedProjectsCount = projects.filter((p) => p.status === 'Completed').length;
  const inProgressProjectsCount = projects.filter((p) => p.status === 'In Progress').length;
  const projectsAvg = projectsCount > 0
    ? Math.round(projects.reduce((acc, p) => acc + (p.status === 'Completed' ? 100 : (Number(p.progress) || 0)), 0) / projectsCount)
    : 0;

  // 3. Goals Metrics
  const goalsCount = goals.length;
  const completedGoalsCount = goals.filter((g) => g.completed || g.status === 'Completed').length;
  const goalsCompletionRate = goalsCount > 0 
    ? Math.round((completedGoalsCount / goalsCount) * 100) 
    : 0;

  // 4. DSA Metrics
  const dsaTopics = dsaData.topics || [];
  const dsaTotalSolved = dsaTopics.reduce((acc, t) => acc + (Number(t.solved) || 0), 0);
  const dsaTotalTarget = dsaTopics.reduce((acc, t) => acc + (Number(t.total) || 0), 0);
  const dsaCompletionRate = dsaTotalTarget > 0 
    ? Math.round((dsaTotalSolved / dsaTotalTarget) * 100) 
    : 0;

  // 5. Roadmap Metrics
  const roadmapCount = roadmapMilestones.length;
  const roadmapCompletedCount = roadmapMilestones.filter((m) => m.status === 'completed').length;
  const roadmapProgress = roadmapCount > 0
    ? Math.round((roadmapCompletedCount / roadmapCount) * 100)
    : 0;

  // 6. Overall Career Progress Score
  const careerScore = Math.round((skillsAvg + projectsAvg + dsaCompletionRate + goalsCompletionRate + roadmapProgress) / 5);

  const totalMilestones = goalsCount + projectsCount + roadmapCount || 10;
  const milestonesCompleted = completedGoalsCount + completedProjectsCount + roadmapCompletedCount;

  let dynamicStatusMessage = "You're making steady progress toward your career goals.";
  if (careerScore >= 80) {
    dynamicStatusMessage = "Outstanding performance! You are demonstrating high engineering readiness.";
  } else if (careerScore >= 60) {
    dynamicStatusMessage = "Strong trajectory! Keep building projects and leveling up your skill proficiencies.";
  } else {
    dynamicStatusMessage = "Great foundation! Focus on completing today's goals and solving DSA problems.";
  }

  const dynamicCareerProgress = {
    percentage: careerScore,
    milestonesCompleted,
    totalMilestones,
    statusMessage: dynamicStatusMessage,
    currentFocus: userProfile?.targetRole ? `${userProfile.targetRole} Preparation & System Design` : "Full-Stack Development & Algorithmic Practice",
    estimatedTimeToReady: "3.5 months"
  };

  // Dynamic 4 Stat Cards
  const dynamicStatCards = [
    {
      id: "skills",
      title: "Total Skills",
      value: `${skillsCount}`,
      badge: `${proficientSkillsCount} Proficient`,
      badgeType: "positive",
      subtitle: `${skillsAvg}% avg mastery`,
      iconName: "Code",
      accentColor: "indigo"
    },
    {
      id: "projects",
      title: "Projects",
      value: `${projectsCount}`,
      badge: `${completedProjectsCount} completed`,
      badgeType: "neutral",
      subtitle: `${inProgressProjectsCount} in progress`,
      iconName: "FolderGit2",
      accentColor: "purple"
    },
    {
      id: "goals",
      title: "Goals Completed",
      value: `${completedGoalsCount} / ${goalsCount}`,
      badge: `${goalsCompletionRate}% completed`,
      badgeType: "positive",
      subtitle: `${goalsCount - completedGoalsCount} remaining`,
      iconName: "Target",
      accentColor: "cyan"
    },
    {
      id: "dsa",
      title: "DSA Progress",
      value: `${dsaCompletionRate}%`,
      badge: `${dsaTotalSolved} solved`,
      badgeType: "positive",
      subtitle: `Target: ${dsaTotalTarget} problems`,
      iconName: "Binary",
      accentColor: "emerald"
    }
  ];

  /* =========================================================================
     QUICK ACTIONS & MUTATION HANDLERS (API INTEGRATED)
     ========================================================================= */

  const handleActionClick = (type) => {
    if (type === 'roadmap') {
      navigate('/roadmap');
    } else if (type === 'dsa') {
      setSelectedDsaTopic(dsaTopics[0] || null);
      setActiveModal('dsa');
    } else {
      setActiveModal(type);
    }
  };

  const handleSaveSkill = async (newSkill) => {
    try {
      const res = await api.skills.create(newSkill);
      if (res && res.success && res.data) {
        const updated = [res.data, ...skills];
        setSkills(updated);
        saveSkills(updated);
        showToast(`Added skill: "${res.data.name}" (${res.data.level || res.data.progress}%)`, 'success');
        setActiveModal(null);
      } else {
        showToast(res?.message || 'Failed to save skill', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error creating skill', 'error');
    }
  };

  const handleSaveProject = async (newProj) => {
    try {
      const res = await api.projects.create(newProj);
      if (res && res.success && res.data) {
        const updated = [res.data, ...projects];
        setProjects(updated);
        saveProjects(updated);
        showToast(`Created project: "${res.data.title || res.data.name}"`, 'success');
        setActiveModal(null);
      } else {
        showToast(res?.message || 'Failed to create project', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error creating project', 'error');
    }
  };

  const handleSaveGoal = async (newGoal) => {
    try {
      const res = await api.goals.create(newGoal);
      if (res && res.success && res.data) {
        const updated = [res.data, ...goals];
        setGoals(updated);
        saveGoals(updated);
        showToast(`Added goal: "${res.data.title || res.data.task}"`, 'success');
        setActiveModal(null);
      } else {
        showToast(res?.message || 'Failed to create goal', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error creating goal', 'error');
    }
  };

  const handleSaveDSA = async (updatedTopic) => {
    const topicId = updatedTopic._id || updatedTopic.id || updatedTopic.topic;
    try {
      const res = await api.dsa.update(topicId, updatedTopic);
      if (res && res.success && res.data) {
        const updatedTopics = dsaTopics.map((t) =>
          (t._id === topicId || t.id === topicId || t.topic === updatedTopic.topic) ? res.data : t
        );
        const updated = {
          ...dsaData,
          topics: updatedTopics,
          summary: {
            ...dsaData.summary,
            totalSolved: updatedTopics.reduce((acc, t) => acc + (Number(t.solved) || 0), 0),
            targetGoal: updatedTopics.reduce((acc, t) => acc + (Number(t.total) || 0), 0)
          }
        };
        setDsaData(updated);
        saveDSA(updated);
        showToast(`Updated ${updatedTopic.topic} DSA progress!`, 'success');
        setActiveModal(null);
      } else {
        showToast(res?.message || 'Failed to update topic', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error updating DSA topic', 'error');
    }
  };

  const handleToggleGoal = async (id) => {
    const goal = goals.find(g => (g._id === id || g.id === id));
    if (!goal) return;

    const actualId = goal._id || goal.id;
    const isCurrentlyDone = Boolean(goal.completed || goal.status === 'Completed');
    const nextDone = !isCurrentlyDone;

    // Optimistic
    const updated = goals.map((g) => {
      if (g._id === actualId || g.id === actualId) {
        return {
          ...g,
          completed: nextDone,
          status: nextDone ? 'Completed' : 'In Progress',
          progress: nextDone ? 100 : (g.progress === 100 ? 50 : (g.progress || 0))
        };
      }
      return g;
    });

    setGoals(updated);

    try {
      const res = await api.goals.update(actualId, {
        completed: nextDone,
        status: nextDone ? 'Completed' : 'In Progress'
      });
      if (res && res.success && res.data) {
        const synced = goals.map(g => (g._id === actualId || g.id === actualId ? res.data : g));
        setGoals(synced);
        saveGoals(synced);
        if (nextDone) {
          showToast(`Completed: "${goal.title || goal.task}" 🎉`, 'success');
        }
      } else {
        setGoals(goals);
        showToast(res?.message || 'Failed to update goal', 'error');
      }
    } catch (err) {
      setGoals(goals);
      showToast(err.message || 'Error updating goal', 'error');
    }
  };

  const handleSeedStarterData = async () => {
    try {
      setIsSeeding(true);
      const res = await api.seed(false);
      if (res && res.success) {
        showToast('Starter portfolio data loaded into database!', 'success');
        await fetchDashboardData();
      } else {
        showToast(res?.message || 'Could not seed data', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Error loading starter data', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const displayName = user?.name || userProfile?.name || 'Engineer';

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Greeting Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card p-6 sm:p-8 relative overflow-hidden border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-[#111726]/80 to-purple-950/40"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>CareerOS • MongoDB Atlas Connected</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {displayName} <span className="inline-block animate-wave">👋</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl">
              Your personalized cloud career workspace is connected. Track competencies, build portfolio projects, and monitor your career readiness.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/careers"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all group"
            >
              <Compass className="w-4 h-4" />
              <span>Career Catalog</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/roadmap"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/5 transition-all"
            >
              <span>Milestones</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Error Banner with Retry */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-4 text-rose-400">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* New Account Onboarding / Starter Data Banner */}
      {skillsCount === 0 && projectsCount === 0 && goalsCount === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 border-indigo-500/30 bg-indigo-500/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Get Started with Your Cloud Workspace</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              You haven't tracked any skills, projects, or goals yet. You can build your own using the Quick Actions below or load curated sample data to explore CareerOS features.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSeedStarterData}
            disabled={isSeeding}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all flex-shrink-0"
          >
            {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            <span>Load Starter Samples</span>
          </button>
        </motion.div>
      )}

      {/* Quick Actions Floating Strip */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Quick Actions:
        </span>
        <button
          onClick={() => handleActionClick('skill')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08] hover:border-indigo-500/40 hover:text-indigo-400 transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-400" />
          Add Skill
        </button>
        <button
          onClick={() => handleActionClick('project')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08] hover:border-purple-500/40 hover:text-purple-400 transition-all"
        >
          <FolderPlus className="w-3.5 h-3.5 text-purple-400" />
          Add Project
        </button>
        <button
          onClick={() => handleActionClick('goal')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08] hover:border-cyan-500/40 hover:text-cyan-400 transition-all"
        >
          <Target className="w-3.5 h-3.5 text-cyan-400" />
          Add Goal
        </button>
        <button
          onClick={() => handleActionClick('dsa')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40 hover:text-emerald-400 transition-all"
        >
          <Binary className="w-3.5 h-3.5 text-emerald-400" />
          Update DSA
        </button>
        <button
          onClick={() => handleActionClick('roadmap')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
        >
          <Compass className="w-3.5 h-3.5" />
          View Roadmap
        </button>
      </div>

      {/* Dynamic Career Progress Card */}
      <ProgressCard progressData={dynamicCareerProgress} />

      {/* Day 11 Assessment & Adaptive Learning Insight Banner */}
      {assessmentDiagnostics && (
        <div className="glass-card p-5 border-indigo-500/20 bg-gradient-to-r from-indigo-950/30 via-slate-900/60 to-purple-950/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex-shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">
                  Adaptive Learning Diagnostics
                </span>
                {assessmentDiagnostics.totalAttempts > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {assessmentDiagnostics.averageScore}% Avg Score ({assessmentDiagnostics.totalAttempts} Attempts)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                {assessmentDiagnostics.decliningTopics?.length > 0
                  ? `Areas needing revision: ${assessmentDiagnostics.decliningTopics.join(', ')}`
                  : assessmentDiagnostics.totalAttempts > 0
                  ? `Strong competencies: ${(assessmentDiagnostics.strongTopics || []).join(', ') || 'All assessed areas healthy'}`
                  : 'Take your first module assessment to activate automated skill recalibration and diagnostic guidance.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {assessmentDiagnostics.recommendations?.[0] ? (
              <a
                href={assessmentDiagnostics.recommendations[0].targetUrl}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all"
              >
                <span>{assessmentDiagnostics.recommendations[0].title}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            ) : (
              <Link
                to="/careers/full-stack-developer/roadmap"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/30 transition-all"
              >
                <span>Take Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Dynamic 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {dynamicStatCards.map((stat, idx) => (
          <StatCard key={stat.id} item={stat} index={idx} />
        ))}
      </div>

      {/* Grid: Career Roadmap + Real Skill Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Career Roadmap (Left 7 cols) */}
        <div className="lg:col-span-7 glass-card p-5 sm:p-6">
          <Roadmap 
            milestones={roadmapMilestones} 
            targetRole={userProfile?.targetRole || defaultStudentProfile.targetRole}
            isCompact={true}
          />
        </div>

        {/* Skill Progress (Right 5 cols) backed by real Database records */}
        <div className="lg:col-span-5 glass-card p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Skill Progress
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Mastery levels in primary technologies ({skillsCount} total)
                  </p>
                </div>
              </div>
              <Link
                to="/skills"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                All Skills →
              </Link>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="space-y-2 py-4">
                  <div className="w-full h-8 bg-white/5 rounded-lg animate-pulse" />
                  <div className="w-full h-8 bg-white/5 rounded-lg animate-pulse" />
                </div>
              ) : skills.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No skills tracked yet. Use Quick Actions or load starter samples!
                </p>
              ) : (
                skills.slice(0, 6).map((skill, idx) => (
                  <SkillCard key={skill._id || skill.id || skill.name} skill={skill} index={idx} />
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06] text-center">
            <Link
              to="/skills"
              className="text-xs text-slate-400 hover:text-indigo-400 transition-colors inline-flex items-center gap-1"
            >
              <span>{skills.length > 6 ? `Evaluate ${skills.length - 6} more competencies` : 'Manage skill competencies'}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Weekly Activity Chart + Real Today's Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Activity Chart (Left 7 cols) */}
        <div className="lg:col-span-7">
          <ActivityChart data={activityData} />
        </div>

        {/* Goals (Right 5 cols) directly synced with Database */}
        <div className="lg:col-span-5">
          <GoalCard 
            goals={goals} 
            onToggleGoal={handleToggleGoal}
            onAddGoalClick={() => handleActionClick('goal')} 
          />
        </div>
      </div>

      {/* Recent Projects backed by Database */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Projects
            </h3>
            <p className="text-xs text-slate-400">
              Hands-on applications demonstrating technical depth ({projectsCount} active)
            </p>
          </div>
          <Link
            to="/projects"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center gap-1"
          >
            <span>Explore All Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="glass-card p-6 space-y-3 animate-pulse">
                <div className="w-24 h-4 bg-white/10 rounded" />
                <div className="w-full h-8 bg-white/5 rounded" />
              </div>
            ))
          ) : projects.length === 0 ? (
            <div className="col-span-3 glass-card p-8 text-center text-xs text-slate-400">
              No projects added yet. Click "Add Project" in Quick Actions to showcase your work!
            </div>
          ) : (
            projects.slice(0, 3).map((proj) => {
              const projId = proj._id || proj.id;
              const normalized = {
                ...proj,
                id: projId,
                title: proj.title || proj.name,
                techStack: proj.techStack || proj.technologies || []
              };
              return (
                <ProjectCard 
                  key={projId} 
                  project={normalized} 
                  onViewDetails={() => navigate('/projects')}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Modals for Functional Quick Actions */}
      <SkillModal
        isOpen={activeModal === 'skill'}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveSkill}
      />

      <ProjectModal
        isOpen={activeModal === 'project'}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveProject}
      />

      <GoalModal
        isOpen={activeModal === 'goal'}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveGoal}
      />

      <DSAModal
        isOpen={activeModal === 'dsa'}
        onClose={() => setActiveModal(null)}
        topicData={selectedDsaTopic || dsaTopics[0]}
        onSave={handleSaveDSA}
      />
    </div>
  );
}
