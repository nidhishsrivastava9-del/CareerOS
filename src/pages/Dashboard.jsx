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
  Binary
} from 'lucide-react';
import { 
  studentProfile as defaultStudentProfile, 
  roadmapMilestones, 
  weeklyActivityData, 
  resumeData 
} from '../data/dummyData';
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
  subscribeToStorage, 
  STORAGE_KEYS 
} from '../utils/storage';

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

  // Real LocalStorage-backed state
  const [skills, setSkills] = useState(() => getSkills());
  const [projects, setProjects] = useState(() => getProjects());
  const [goals, setGoals] = useState(() => getGoals());
  const [dsaData, setDsaData] = useState(() => getDSA());
  const [userProfile, setUserProfile] = useState(() => getUser());

  // Modal controls for functional Quick Actions
  const [activeModal, setActiveModal] = useState(null); // 'skill' | 'project' | 'goal' | 'dsa'
  const [selectedDsaTopic, setSelectedDsaTopic] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Subscribe to central LocalStorage changes
  useEffect(() => {
    const unsubscribe = subscribeToStorage((key, data) => {
      if (key === STORAGE_KEYS.SKILLS && Array.isArray(data)) setSkills(data);
      if (key === STORAGE_KEYS.PROJECTS && Array.isArray(data)) setProjects(data);
      if (key === STORAGE_KEYS.GOALS && Array.isArray(data)) setGoals(data);
      if (key === STORAGE_KEYS.DSA && data) setDsaData(data);
      if (key === STORAGE_KEYS.USER && data) setUserProfile(data);
    });
    return unsubscribe;
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  /* =========================================================================
     DYNAMIC STATISTICS & CAREER PROGRESS CALCULATION
     ========================================================================= */

  // 1. Skills Metrics
  const skillsCount = skills.length;
  const proficientSkillsCount = skills.filter((s) => (Number(s.level) || 0) >= 75).length;
  const skillsAvg = skillsCount > 0 
    ? Math.round(skills.reduce((acc, s) => acc + (Number(s.level) || 0), 0) / skillsCount) 
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

  // 5. Overall Career Progress Score (Simple, transparent average)
  // Career Progress = average of: (Skills mastery, Projects completion, DSA coverage, Goals rate)
  const careerScore = Math.round((skillsAvg + projectsAvg + dsaCompletionRate + goalsCompletionRate) / 4);

  const totalMilestones = goalsCount + projectsCount || 10;
  const milestonesCompleted = completedGoalsCount + completedProjectsCount;

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
    currentFocus: "Full-Stack Development & Algorithmic Practice",
    estimatedTimeToReady: "3.5 months"
  };

  // Dynamic 4 Stat Cards
  const dynamicStatCards = [
    {
      id: "skills",
      title: "Skills",
      value: `${proficientSkillsCount} / ${skillsCount}`,
      badge: `${skillsAvg}% avg mastery`,
      badgeType: "positive",
      subtitle: "Competencies mastered",
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
      id: "dsa",
      title: "DSA Progress",
      value: `${dsaCompletionRate}%`,
      badge: `${dsaTotalSolved} problems solved`,
      badgeType: "positive",
      subtitle: `Target: ${dsaTotalTarget} problems`,
      iconName: "Binary",
      accentColor: "cyan"
    },
    {
      id: "resume",
      title: "Resume Strength",
      value: `${resumeData.score || 80}%`,
      badge: `${completedGoalsCount} goals done`,
      badgeType: "positive",
      subtitle: "ATS Optimization Score",
      iconName: "FileCheck2",
      accentColor: "emerald"
    }
  ];

  /* =========================================================================
     QUICK ACTIONS & MUTATION HANDLERS
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

  const handleSaveSkill = (newSkill) => {
    const updated = [newSkill, ...skills];
    setSkills(updated);
    saveSkills(updated);
    showToast(`Added skill: "${newSkill.name}" (${newSkill.level}%)`);
  };

  const handleSaveProject = (newProj) => {
    const updated = [newProj, ...projects];
    setProjects(updated);
    saveProjects(updated);
    showToast(`Created project: "${newProj.title}"`);
  };

  const handleSaveGoal = (newGoal) => {
    const updated = [newGoal, ...goals];
    setGoals(updated);
    saveGoals(updated);
    showToast(`Added goal: "${newGoal.title}"`);
  };

  const handleSaveDSA = (updatedTopic) => {
    const updatedTopics = dsaTopics.map((t) =>
      t.topic === updatedTopic.topic ? updatedTopic : t
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
    showToast(`Updated ${updatedTopic.topic} DSA progress!`);
  };

  const handleToggleGoal = (id) => {
    const updated = goals.map((g) => {
      if (g.id === id) {
        const nextDone = !(g.completed || g.status === 'Completed');
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
    saveGoals(updated);
    const target = updated.find(g => g.id === id);
    if (target?.completed) {
      showToast(`Completed: "${target.title || target.task}" 🎉`);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Toast Notification */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-20 right-8 z-50 px-4 py-3 rounded-xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 flex items-center gap-2 text-xs font-semibold"
        >
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </motion.div>
      )}

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
              <span>CareerOS v1.0 • Personalized Learning Path</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Good evening, {userProfile.roleTitle || 'Developer'} <span className="inline-block animate-wave">👋</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl">
              Ready to take the next step in your career? Track your mastery, build verifiable projects, and land your dream role.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/roadmap"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all group"
            >
              <span>View Career Roadmap</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.div>

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
            targetRole={userProfile.targetRole || defaultStudentProfile.targetRole}
            isCompact={true}
          />
        </div>

        {/* Skill Progress (Right 5 cols) backed by real LocalStorage */}
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
              {skills.slice(0, 6).map((skill, idx) => (
                <SkillCard key={skill.id || skill.name} skill={skill} index={idx} />
              ))}
              {skills.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No skills tracked yet. Use Quick Actions to add one!</p>
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
          <ActivityChart data={weeklyActivityData} />
        </div>

        {/* Today's Goals (Right 5 cols) directly synced with LocalStorage */}
        <div className="lg:col-span-5">
          <GoalCard 
            goals={goals} 
            onToggleGoal={handleToggleGoal}
            onAddGoalClick={() => handleActionClick('goal')} 
          />
        </div>
      </div>

      {/* Real Recent Projects backed by LocalStorage */}
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
          {projects.slice(0, 3).map((proj) => (
            <ProjectCard 
              key={proj.id} 
              project={proj} 
              onViewDetails={() => navigate('/projects')}
            />
          ))}
          {projects.length === 0 && (
            <div className="col-span-3 glass-card p-6 text-center text-xs text-slate-400">
              No projects added yet. Click "Add Project" in Quick Actions to showcase your work!
            </div>
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
