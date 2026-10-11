/**
 * CareerOS — Central LocalStorage Data Engine
 * Safe, robust persistence utility for student career metrics.
 * Designed to mirror future RESTful API endpoints (/api/v1/...).
 */

import { 
  skillProgressData, 
  recentProjectsData, 
  initialGoalsData, 
  dsaTopicsData, 
  dsaSummary, 
  studentProfile,
  roadmapMilestones as defaultMilestones,
  weeklyActivityData as defaultWeeklyActivity,
  resumeData as defaultResumeData
} from '../data/dummyData.js';

export const STORAGE_KEYS = {
  SKILLS: 'careeros_skills',
  PROJECTS: 'careeros_projects',
  GOALS: 'careeros_goals',
  DSA: 'careeros_dsa',
  USER: 'careeros_user',
  CERTIFICATIONS: 'careeros_certifications',
  RESUME: 'careeros_resume',
  ROADMAP: 'careeros_roadmap',
  ACTIVITY: 'careeros_activity'
};

const STORAGE_EVENT_NAME = 'careeros_storage_updated';

/**
 * Safe retrieval from LocalStorage with error boundary and fallback
 */
export function getData(key, fallback = null) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback;
    }
    const item = window.localStorage.getItem(key);
    if (item === null || item === undefined || item === '') {
      return fallback;
    }
    return JSON.parse(item);
  } catch (err) {
    console.warn(`[CareerOS Storage] Failed to read or parse key "${key}":`, err);
    return fallback;
  }
}

/**
 * Safe write to LocalStorage with custom sync event dispatch
 */
export function setData(key, data) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const serialized = JSON.stringify(data);
    window.localStorage.setItem(key, serialized);

    // Dispatch custom browser event for reactive real-time updates across components
    try {
      window.dispatchEvent(
        new CustomEvent(STORAGE_EVENT_NAME, { detail: { key, data } })
      );
    } catch {
      const event = document.createEvent('Event');
      event.initEvent(STORAGE_EVENT_NAME, true, true);
      window.dispatchEvent(event);
    }
    return true;
  } catch (err) {
    console.error(`[CareerOS Storage] Failed to persist key "${key}":`, err);
    return false;
  }
}

/**
 * Update an existing LocalStorage entry using either an updater function or a partial object
 */
export function updateData(key, updaterOrPartial) {
  try {
    const current = getData(key, null);
    let updated;
    if (typeof updaterOrPartial === 'function') {
      updated = updaterOrPartial(current);
    } else if (current && typeof current === 'object' && !Array.isArray(current)) {
      updated = { ...current, ...updaterOrPartial };
    } else {
      updated = updaterOrPartial;
    }
    setData(key, updated);
    return updated;
  } catch (err) {
    console.error(`[CareerOS Storage] Failed to update key "${key}":`, err);
    return null;
  }
}

/**
 * Remove specific key from LocalStorage
 */
export function removeData(key) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.removeItem(key);
    window.dispatchEvent(
      new CustomEvent(STORAGE_EVENT_NAME, { detail: { key, data: null } })
    );
  } catch (err) {
    console.warn(`[CareerOS Storage] Failed to remove key "${key}":`, err);
  }
}

/**
 * Subscribe to storage updates (both within same tab and across multi-tabs)
 */
export function subscribeToStorage(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e) => {
    callback(e.detail?.key, e.detail?.data);
  };

  const handleStorageEvent = (e) => {
    if (e.key && Object.values(STORAGE_KEYS).includes(e.key)) {
      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : null;
        callback(e.key, parsed);
      } catch {
        callback(e.key, null);
      }
    }
  };

  window.addEventListener(STORAGE_EVENT_NAME, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(STORAGE_EVENT_NAME, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}

/* =========================================================================
   INITIAL DATA SEEDING HELPERS
   ========================================================================= */

export function getInitialSkills() {
  return skillProgressData.map((s, idx) => ({
    id: `skill-${idx + 1}-${Date.now().toString(36)}`,
    name: s.name,
    category: s.category || 'Frontend',
    level: Number(s.level) || 50,
    status: s.status || (s.level >= 75 ? 'Proficient' : 'Learning'),
    color: s.color || '#6366F1'
  }));
}

export function getInitialProjects() {
  return recentProjectsData.map((p, idx) => ({
    id: p.id || `proj-${idx + 1}`,
    title: p.title || 'Untitled Project',
    description: p.description || '',
    techStack: Array.isArray(p.techStack) ? p.techStack : ['React'],
    status: p.status || 'In Progress',
    progress: Number(p.progress) || 50,
    githubUrl: p.githubUrl || 'https://github.com',
    demoUrl: p.demoUrl || '',
    featured: Boolean(p.featured)
  }));
}

export function getInitialGoals() {
  return [
    {
      id: 'goal-1',
      title: 'Solve 5 DSA questions',
      task: 'Solve 5 DSA questions',
      description: 'Practice 5 LeetCode medium questions covering sliding window and two pointers.',
      category: 'Daily',
      deadline: 'Today, 8:00 PM',
      priority: 'High',
      completed: true,
      progress: 100,
      status: 'Completed'
    },
    {
      id: 'goal-2',
      title: 'Complete React hooks lesson',
      task: 'Complete React hooks lesson',
      description: 'Master useEffect cleanup, useMemo optimization, and custom hook design.',
      category: 'Daily',
      deadline: 'Today, 10:00 PM',
      priority: 'Medium',
      completed: true,
      progress: 100,
      status: 'Completed'
    },
    {
      id: 'goal-3',
      title: 'Work on portfolio project',
      task: 'Work on portfolio project',
      description: 'Integrate dynamic responsive components and LocalStorage persistence.',
      category: 'Short-Term',
      deadline: 'Tomorrow, 6:00 PM',
      priority: 'High',
      completed: false,
      progress: 40,
      status: 'In Progress'
    },
    {
      id: 'goal-4',
      title: 'Read DBMS notes & indexing concepts',
      task: 'Read DBMS notes & indexing concepts',
      description: 'Review B-Trees, Hash Indexes, ACID transactions, and query plans.',
      category: 'Short-Term',
      deadline: 'Friday, 5:00 PM',
      priority: 'Medium',
      completed: false,
      progress: 20,
      status: 'In Progress'
    },
    {
      id: 'goal-5',
      title: 'Complete Meta Frontend Certificate Capstone',
      task: 'Complete Meta Frontend Certificate Capstone',
      description: 'Finalize accessible UI forms, automated tests, and submit review.',
      category: 'Long-Term',
      deadline: 'Oct 15, 2026',
      priority: 'High',
      completed: false,
      progress: 60,
      status: 'In Progress'
    },
    {
      id: 'goal-6',
      title: 'Solve 150 LeetCode Mediums',
      task: 'Solve 150 LeetCode Mediums',
      description: 'Targeted preparation for engineering summer internship technical rounds.',
      category: 'Long-Term',
      deadline: 'Nov 30, 2026',
      priority: 'Medium',
      completed: false,
      progress: 35,
      status: 'In Progress'
    }
  ];
}

export function getInitialDSA() {
  const defaultTopics = [
    { topic: 'Arrays', solved: 18, total: 25, easy: 10, medium: 7, hard: 1, color: 'from-blue-500 to-indigo-600' },
    { topic: 'Strings', solved: 15, total: 20, easy: 8, medium: 6, hard: 1, color: 'from-indigo-500 to-purple-600' },
    { topic: 'Linked List', solved: 10, total: 15, easy: 6, medium: 4, hard: 0, color: 'from-purple-500 to-pink-600' },
    { topic: 'Stack', solved: 8, total: 12, easy: 4, medium: 3, hard: 1, color: 'from-pink-500 to-rose-600' },
    { topic: 'Queue', solved: 6, total: 10, easy: 4, medium: 2, hard: 0, color: 'from-rose-500 to-amber-600' },
    { topic: 'Trees', solved: 12, total: 20, easy: 5, medium: 5, hard: 2, color: 'from-emerald-500 to-teal-600' },
    { topic: 'Graphs', solved: 8, total: 18, easy: 3, medium: 4, hard: 1, color: 'from-teal-500 to-cyan-600' },
    { topic: 'Sorting', solved: 11, total: 15, easy: 6, medium: 4, hard: 1, color: 'from-amber-500 to-orange-600' },
    { topic: 'Searching', solved: 9, total: 14, easy: 5, medium: 3, hard: 1, color: 'from-violet-500 to-purple-600' },
    { topic: 'Dynamic Programming', solved: 7, total: 25, easy: 2, medium: 4, hard: 1, color: 'from-cyan-500 to-blue-600' }
  ];

  const totalSolved = defaultTopics.reduce((acc, t) => acc + (Number(t.solved) || 0), 0);
  const targetGoal = defaultTopics.reduce((acc, t) => acc + (Number(t.total) || 0), 0);

  return {
    topics: defaultTopics,
    summary: {
      totalSolved,
      targetGoal,
      easy: 42,
      medium: 35,
      hard: 7,
      activeStreakDays: 14,
      acceptanceRate: '76.4%'
    }
  };
}

export function getInitialCertifications() {
  return [
    { id: 'cert-1', name: 'Meta Frontend Developer Professional Certificate', issuer: 'Coursera', date: '2025', url: 'https://coursera.org' },
    { id: 'cert-2', name: 'JavaScript Algorithms & Data Structures', issuer: 'freeCodeCamp', date: '2024', url: 'https://freecodecamp.org' }
  ];
}

export function getInitialResume() {
  return {
    ...defaultResumeData,
    certifications: getInitialCertifications()
  };
}

export function getInitialRoadmap() {
  return defaultMilestones;
}

export function getInitialActivity() {
  return [
    { day: 'Mon', hours: 4.5, problemsSolved: 4, commits: 7 },
    { day: 'Tue', hours: 6.0, problemsSolved: 6, commits: 12 },
    { day: 'Wed', hours: 3.5, problemsSolved: 3, commits: 5 },
    { day: 'Thu', hours: 5.5, problemsSolved: 5, commits: 9 },
    { day: 'Fri', hours: 4.0, problemsSolved: 4, commits: 8 },
    { day: 'Sat', hours: 7.0, problemsSolved: 8, commits: 15 },
    { day: 'Sun', hours: 5.0, problemsSolved: 5, commits: 6 }
  ];
}

/* =========================================================================
   DOMAIN SPECIFIC GETTERS AND SETTERS
   ========================================================================= */

export function getSkills() {
  const existing = getData(STORAGE_KEYS.SKILLS, null);
  if (Array.isArray(existing)) {
    return existing;
  }
  return [];
}

export function saveSkills(skills) {
  const safeSkills = Array.isArray(skills) ? skills : [];
  setData(STORAGE_KEYS.SKILLS, safeSkills);
  return safeSkills;
}

export function getProjects() {
  const existing = getData(STORAGE_KEYS.PROJECTS, null);
  if (Array.isArray(existing)) {
    return existing;
  }
  return [];
}

export function saveProjects(projects) {
  const safeProjects = Array.isArray(projects) ? projects : [];
  setData(STORAGE_KEYS.PROJECTS, safeProjects);
  return safeProjects;
}

export function getGoals() {
  const existing = getData(STORAGE_KEYS.GOALS, null);
  if (Array.isArray(existing)) {
    return existing;
  }
  return [];
}

export function saveGoals(goals) {
  const safeGoals = Array.isArray(goals) ? goals : [];
  setData(STORAGE_KEYS.GOALS, safeGoals);
  return safeGoals;
}

export function getDSA() {
  const existing = getData(STORAGE_KEYS.DSA, null);
  if (existing && Array.isArray(existing.topics)) {
    return existing;
  }
  return {
    topics: [],
    summary: {
      totalSolved: 0,
      targetGoal: 0,
      easy: 0,
      medium: 0,
      hard: 0
    }
  };
}

export function saveDSA(dsaData) {
  let safeDSA;
  if (dsaData && Array.isArray(dsaData.topics)) {
    const totalSolved = dsaData.topics.reduce((acc, t) => acc + (Number(t.solved) || 0), 0);
    const targetGoal = dsaData.topics.reduce((acc, t) => acc + (Number(t.total) || 0), 0);
    safeDSA = {
      ...dsaData,
      summary: {
        ...(dsaData.summary || {}),
        totalSolved,
        targetGoal
      }
    };
  } else {
    safeDSA = getInitialDSA();
  }
  setData(STORAGE_KEYS.DSA, safeDSA);
  return safeDSA;
}

export function getUser() {
  const existing = getData(STORAGE_KEYS.USER, null);
  if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
    return existing;
  }
  setData(STORAGE_KEYS.USER, studentProfile);
  return studentProfile;
}

export function saveUser(user) {
  const safeUser = user && typeof user === 'object' && !Array.isArray(user) ? user : studentProfile;
  setData(STORAGE_KEYS.USER, safeUser);
  return safeUser;
}

export function getCertifications() {
  const existing = getData(STORAGE_KEYS.CERTIFICATIONS, null);
  if (Array.isArray(existing)) {
    return existing;
  }
  const initial = getInitialCertifications();
  setData(STORAGE_KEYS.CERTIFICATIONS, initial);
  return initial;
}

export function saveCertifications(certs) {
  const safeCerts = Array.isArray(certs) ? certs : [];
  setData(STORAGE_KEYS.CERTIFICATIONS, safeCerts);
  return safeCerts;
}

export function getResume() {
  const existing = getData(STORAGE_KEYS.RESUME, null);
  if (existing && typeof existing === 'object') {
    return existing;
  }
  const initial = getInitialResume();
  setData(STORAGE_KEYS.RESUME, initial);
  return initial;
}

export function saveResume(resume) {
  const safeResume = resume && typeof resume === 'object' ? resume : getInitialResume();
  setData(STORAGE_KEYS.RESUME, safeResume);
  return safeResume;
}

export function getRoadmap() {
  const existing = getData(STORAGE_KEYS.ROADMAP, null);
  if (Array.isArray(existing)) {
    return existing;
  }
  const initial = getInitialRoadmap();
  setData(STORAGE_KEYS.ROADMAP, initial);
  return initial;
}

export function saveRoadmap(roadmap) {
  const safeRoadmap = Array.isArray(roadmap) ? roadmap : [];
  setData(STORAGE_KEYS.ROADMAP, safeRoadmap);
  return safeRoadmap;
}

export function getActivity() {
  const existing = getData(STORAGE_KEYS.ACTIVITY, null);
  if (Array.isArray(existing)) {
    return existing;
  }
  const initial = getInitialActivity();
  setData(STORAGE_KEYS.ACTIVITY, initial);
  return initial;
}

export function saveActivity(activity) {
  const safeActivity = Array.isArray(activity) ? activity : [];
  setData(STORAGE_KEYS.ACTIVITY, safeActivity);
  return safeActivity;
}

/**
 * Resets all CareerOS keys back to factory dummy data
 */
export function resetToDefaults() {
  saveSkills(getInitialSkills());
  saveProjects(getInitialProjects());
  saveGoals(getInitialGoals());
  saveDSA(getInitialDSA());
  saveUser(studentProfile);
  saveCertifications(getInitialCertifications());
  saveResume(getInitialResume());
  saveRoadmap(getInitialRoadmap());
  saveActivity(getInitialActivity());
}
