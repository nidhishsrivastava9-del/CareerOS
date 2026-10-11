/**
 * CareerOS — In-Memory Data Store (Day 4 Temporary Storage)
 * 
 * Note: Data resides in memory and will reset upon server restart.
 * MongoDB and Mongoose persistence will replace this in Day 5.
 */

import { CAREERS_SEED } from './careersSeedData.js';
import { RESOURCES_SEED } from './resourcesSeedData.js';

// Safe unique ID generator
export const generateId = (prefix = 'id') => 
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

// 0. Registered Users (in-memory fallback when MongoDB is unavailable)
export let memoryUsers = [];

// 0.1 In-memory careers fallback
export let memoryCareers = [...CAREERS_SEED];

// 0.2 In-memory user learning progress fallback
export let memoryProgress = [];

// 0.3 In-memory resources fallback (Day 8)
export let memoryResources = [...RESOURCES_SEED];

// 0.4 In-memory knowledge chunks fallback (Day 10 RAG)
export let memoryKnowledgeChunks = [];

// 0.5 In-memory Assessment Engine fallbacks (Day 11)
export let memoryQuestions = [];
export let memoryAssessments = [];
export let memoryAssessmentAttempts = [];
export let memorySkillMasteries = [];

// 1. Skills
export let skills = [
  {
    id: 'skill-1',
    name: 'JavaScript',
    category: 'Frontend',
    progress: 85
  },
  {
    id: 'skill-2',
    name: 'React',
    category: 'Frontend',
    progress: 65
  },
  {
    id: 'skill-3',
    name: 'Node.js',
    category: 'Backend',
    progress: 40
  },
  {
    id: 'skill-4',
    name: 'MongoDB',
    category: 'Database',
    progress: 35
  },
  {
    id: 'skill-5',
    name: 'Git/GitHub',
    category: 'DevOps',
    progress: 80
  },
  {
    id: 'skill-6',
    name: 'DSA',
    category: 'Core CS',
    progress: 42
  }
];

// 2. Projects
export let projects = [
  {
    id: 'proj-1',
    name: 'AI Study Buddy',
    description: 'Intelligent flashcard generator and real-time study tutor leveraging LLMs and spaced repetition.',
    technologies: ['React', 'Node.js', 'MongoDB', 'AI'],
    githubUrl: 'https://github.com/alexrivera/ai-study-buddy',
    liveUrl: 'https://studybuddy-demo.app',
    status: 'In Progress',
    progress: 65
  },
  {
    id: 'proj-2',
    name: 'NS Gaming Hub',
    description: 'Responsive browser gaming portal featuring classic arcade titles and local leaderboards.',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    githubUrl: 'https://github.com/alexrivera/ns-gaming-hub',
    liveUrl: 'https://nsgaminghub.io',
    status: 'Completed',
    progress: 100
  },
  {
    id: 'proj-3',
    name: 'Food Nutrition Calculator',
    description: 'Macro-nutrient tracker consuming Edamam Food API with dynamic charts and weekly calorie insights.',
    technologies: ['React', 'API', 'Tailwind CSS'],
    githubUrl: 'https://github.com/alexrivera/nutrition-calc',
    liveUrl: 'https://nutri-calc.app',
    status: 'In Progress',
    progress: 45
  }
];

// 3. Goals
export let goals = [
  {
    id: 'goal-1',
    title: 'Solve 5 DSA questions',
    description: 'Practice 5 LeetCode medium questions covering sliding window and two pointers.',
    deadline: 'Today, 8:00 PM',
    category: 'DSA',
    priority: 'High',
    completed: true
  },
  {
    id: 'goal-2',
    title: 'Complete React hooks lesson',
    description: 'Master useEffect cleanup, useMemo optimization, and custom hook design.',
    deadline: 'Today, 10:00 PM',
    category: 'Learning',
    priority: 'Medium',
    completed: true
  },
  {
    id: 'goal-3',
    title: 'Work on portfolio project',
    description: 'Integrate dynamic responsive components and LocalStorage persistence.',
    deadline: 'Tomorrow, 6:00 PM',
    category: 'Projects',
    priority: 'High',
    completed: false
  },
  {
    id: 'goal-4',
    title: 'Read DBMS notes',
    description: 'Review B-Trees, Hash Indexes, ACID transactions, and query plans.',
    deadline: 'Friday, 5:00 PM',
    category: 'Academics',
    priority: 'Medium',
    completed: false
  }
];

// 4. DSA Topics
export let dsaTopics = [
  { id: 'dsa-1', topic: 'Arrays', solved: 18, total: 25, progress: 72 },
  { id: 'dsa-2', topic: 'Strings', solved: 15, total: 20, progress: 75 },
  { id: 'dsa-3', topic: 'Linked List', solved: 10, total: 15, progress: 67 },
  { id: 'dsa-4', topic: 'Stack', solved: 8, total: 12, progress: 67 },
  { id: 'dsa-5', topic: 'Queue', solved: 6, total: 10, progress: 60 },
  { id: 'dsa-6', topic: 'Trees', solved: 12, total: 20, progress: 60 },
  { id: 'dsa-7', topic: 'Graphs', solved: 8, total: 18, progress: 44 },
  { id: 'dsa-8', topic: 'Dynamic Programming', solved: 7, total: 25, progress: 28 }
];
