import express from 'express';
import mongoose from 'mongoose';
import Skill from '../models/Skill.js';
import Project from '../models/Project.js';
import Goal from '../models/Goal.js';
import Dsa, { DEFAULT_DSA_TOPICS } from '../models/Dsa.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

const SAMPLE_SKILLS = [
  { name: 'JavaScript', category: 'Programming', progress: 90, level: 90, status: 'Proficient', color: '#F59E0B' },
  { name: 'React', category: 'Frontend', progress: 85, level: 85, status: 'Proficient', color: '#06B6D4' },
  { name: 'Node.js', category: 'Backend', progress: 75, level: 75, status: 'Proficient', color: '#10B981' },
  { name: 'MongoDB', category: 'Database', progress: 70, level: 70, status: 'Intermediate', color: '#10B981' },
  { name: 'Data Structures & Algorithms', category: 'Core CS', progress: 65, level: 65, status: 'Intermediate', color: '#8B5CF6' },
  { name: 'Git & GitHub', category: 'Tools', progress: 80, level: 80, status: 'Proficient', color: '#EF4444' }
];

const SAMPLE_PROJECTS = [
  {
    name: 'CareerOS Student Platform',
    title: 'CareerOS Student Platform',
    description: 'Comprehensive student career readiness platform featuring MongoDB Atlas, JWT authentication, and interactive dashboards.',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
    techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
    githubUrl: 'https://github.com/example/careeros',
    liveUrl: 'https://careeros.example.com',
    status: 'In Progress',
    progress: 75
  },
  {
    name: 'Algorithmic Visualizer',
    title: 'Algorithmic Visualizer',
    description: 'High-performance interactive sorting and graph traversal visualizer with custom step-by-step animations.',
    technologies: ['React', 'TypeScript', 'Canvas API', 'Web Workers'],
    techStack: ['React', 'TypeScript', 'Canvas API', 'Web Workers'],
    githubUrl: 'https://github.com/example/algo-visualizer',
    liveUrl: 'https://algo-vis.example.com',
    status: 'Completed',
    progress: 100
  },
  {
    name: 'Distributed Cloud Task Queue',
    title: 'Distributed Cloud Task Queue',
    description: 'Lightweight asynchronous task execution worker pool with Redis-backed persistence and health monitoring.',
    technologies: ['Node.js', 'Redis', 'Docker', 'REST API'],
    techStack: ['Node.js', 'Redis', 'Docker', 'REST API'],
    githubUrl: 'https://github.com/example/cloud-tasks',
    liveUrl: '',
    status: 'Planning',
    progress: 25
  }
];

const SAMPLE_GOALS = [
  {
    title: 'Verify Full Database-backed Frontend Integration',
    task: 'Verify Full Database-backed Frontend Integration',
    description: 'Ensure all Skills, Projects, Goals, and DSA metrics are persisted to MongoDB and isolated per user.',
    deadline: 'Today',
    category: 'Development',
    priority: 'High',
    completed: true
  },
  {
    title: 'Solve 10 Medium Graph & DP Problems',
    task: 'Solve 10 Medium Graph & DP Problems',
    description: 'Practice DFS/BFS topological sorting and dynamic programming state transitions on LeetCode.',
    deadline: 'This Week',
    category: 'DSA',
    priority: 'High',
    completed: false
  },
  {
    title: 'Complete CareerOS Learning Hub Architecture',
    task: 'Complete CareerOS Learning Hub Architecture',
    description: 'Design the schema and UI for multi-career catalog and structured roadmap modules (Day 7).',
    deadline: 'Next Week',
    category: 'Architecture',
    priority: 'Medium',
    completed: false
  }
];

/**
 * @route   POST /api/seed
 * @desc    Seed sample starter data for authenticated user if empty or on demand
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { overwrite = false } = req.body || {};

    if (mongoose.connection.readyState === 1) {
      const existingSkillsCount = await Skill.countDocuments({ user: userId });
      const existingProjectsCount = await Project.countDocuments({ user: userId });
      const existingGoalsCount = await Goal.countDocuments({ user: userId });

      // If user already has data and didn't specify overwrite, return existing count
      if (!overwrite && (existingSkillsCount > 0 || existingProjectsCount > 0 || existingGoalsCount > 0)) {
        return res.status(200).json({
          success: true,
          message: 'User already has data. Pass { overwrite: true } to replace.',
          alreadyHasData: true,
          counts: {
            skills: existingSkillsCount,
            projects: existingProjectsCount,
            goals: existingGoalsCount
          }
        });
      }

      if (overwrite) {
        await Promise.all([
          Skill.deleteMany({ user: userId }),
          Project.deleteMany({ user: userId }),
          Goal.deleteMany({ user: userId })
        ]);
      }

      const skillsToInsert = SAMPLE_SKILLS.map(s => ({ ...s, user: userId }));
      const projectsToInsert = SAMPLE_PROJECTS.map(p => ({ ...p, user: userId }));
      const goalsToInsert = SAMPLE_GOALS.map(g => ({ ...g, user: userId }));

      const [createdSkills, createdProjects, createdGoals] = await Promise.all([
        Skill.insertMany(skillsToInsert),
        Project.insertMany(projectsToInsert),
        Goal.insertMany(goalsToInsert)
      ]);

      // Ensure DSA topics exist
      const dsaCount = await Dsa.countDocuments({ user: userId });
      if (dsaCount === 0) {
        const topics = DEFAULT_DSA_TOPICS.map(t => ({ ...t, user: userId }));
        await Dsa.insertMany(topics);
      }

      return res.status(201).json({
        success: true,
        message: 'Sample starter data loaded successfully',
        data: {
          skills: createdSkills,
          projects: createdProjects,
          goals: createdGoals
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'MongoDB not ready, skipped database seed.'
    });
  } catch (error) {
    console.error('[Seed Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to seed sample data',
      error: error.message
    });
  }
});

export default router;
