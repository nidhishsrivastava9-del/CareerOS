import express from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project.js';
import { projects, generateId } from '../data/store.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all project routes
router.use(protect);

/**
 * @route   GET /api/projects
 * @desc    Get all projects for the authenticated user
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      const userProjects = await Project.find({ user: userId }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: userProjects.length,
        data: userProjects
      });
    }

    const userProjects = projects.filter((p) => String(p.user) === String(userId) || !p.user);
    return res.status(200).json({
      success: true,
      count: userProjects.length,
      data: userProjects
    });
  } catch (error) {
    console.error('[Get Projects Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve projects',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/projects
 * @desc    Create a new project for the authenticated user
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      title, 
      description = '', 
      technologies, 
      techStack, 
      githubUrl = '', 
      liveUrl = '', 
      demoUrl = '', 
      status = 'In Progress', 
      progress = 0 
    } = req.body;

    const userId = req.user._id || req.user.id;
    const projectName = name || title;

    if (!projectName || typeof projectName !== 'string' || !projectName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Project name is required and cannot be empty'
      });
    }

    let parsedTechnologies = [];
    const rawTech = technologies !== undefined ? technologies : techStack;
    if (Array.isArray(rawTech)) {
      parsedTechnologies = rawTech.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof rawTech === 'string') {
      parsedTechnologies = rawTech.split(',').map((t) => t.trim()).filter(Boolean);
    }

    const parsedProgress = Number(progress);
    if (isNaN(parsedProgress) || parsedProgress < 0 || parsedProgress > 100) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Progress must be a number between 0 and 100'
      });
    }

    const cleanLiveUrl = (liveUrl || demoUrl || '').trim();

    if (mongoose.connection.readyState === 1) {
      const newProject = await Project.create({
        user: userId,
        name: projectName.trim(),
        title: projectName.trim(),
        description: typeof description === 'string' ? description.trim() : '',
        technologies: parsedTechnologies,
        techStack: parsedTechnologies,
        githubUrl: typeof githubUrl === 'string' ? githubUrl.trim() : '',
        liveUrl: cleanLiveUrl,
        demoUrl: cleanLiveUrl,
        status: typeof status === 'string' && status.trim() ? status.trim() : 'In Progress',
        progress: parsedProgress
      });

      return res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: newProject
      });
    }

    // In-memory fallback
    const newProject = {
      id: generateId('proj'),
      user: userId,
      name: projectName.trim(),
      title: projectName.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      technologies: parsedTechnologies,
      techStack: parsedTechnologies,
      githubUrl: typeof githubUrl === 'string' ? githubUrl.trim() : '',
      liveUrl: cleanLiveUrl,
      demoUrl: cleanLiveUrl,
      status: typeof status === 'string' && status.trim() ? status.trim() : 'In Progress',
      progress: parsedProgress,
      createdAt: new Date().toISOString()
    };
    projects.unshift(newProject);

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: newProject
    });
  } catch (error) {
    console.error('[Create Project Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/projects/:id
 * @desc    Update an existing project owned by the authenticated user
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, title, description, technologies, techStack, githubUrl, liveUrl, demoUrl, status, progress } = req.body;
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const project = await Project.findOne({ _id: id, user: userId });
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or you do not have permission to modify it'
        });
      }

      const updatedName = name !== undefined ? name : title;
      if (updatedName !== undefined) {
        project.name = updatedName.trim();
        project.title = updatedName.trim();
      }
      if (description !== undefined) project.description = description.trim();
      const rawTech = technologies !== undefined ? technologies : techStack;
      if (rawTech !== undefined) {
        project.technologies = Array.isArray(rawTech) ? rawTech : String(rawTech).split(',').map((t) => t.trim());
        project.techStack = project.technologies;
      }
      if (githubUrl !== undefined) project.githubUrl = githubUrl.trim();
      const updatedLiveUrl = liveUrl !== undefined ? liveUrl : demoUrl;
      if (updatedLiveUrl !== undefined) {
        project.liveUrl = updatedLiveUrl.trim();
        project.demoUrl = project.liveUrl;
      }
      if (status !== undefined) project.status = status;
      if (progress !== undefined) project.progress = Number(progress);

      await project.save();

      return res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: project
      });
    }

    // In-memory fallback
    const projectIndex = projects.findIndex((p) => p.id === id);
    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Project not found with id: ${id}`
      });
    }

    const existingProject = projects[projectIndex];
    if (existingProject.user && String(existingProject.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this project'
      });
    }

    const updatedName = name !== undefined ? name : title;
    if (updatedName !== undefined) {
      existingProject.name = updatedName.trim();
      existingProject.title = updatedName.trim();
    }
    if (description !== undefined) existingProject.description = description.trim();
    const rawTech = technologies !== undefined ? technologies : techStack;
    if (rawTech !== undefined) {
      existingProject.technologies = Array.isArray(rawTech) ? rawTech : String(rawTech).split(',').map((t) => t.trim());
      existingProject.techStack = existingProject.technologies;
    }
    if (githubUrl !== undefined) existingProject.githubUrl = githubUrl.trim();
    const updatedLiveUrl = liveUrl !== undefined ? liveUrl : demoUrl;
    if (updatedLiveUrl !== undefined) {
      existingProject.liveUrl = updatedLiveUrl.trim();
      existingProject.demoUrl = existingProject.liveUrl;
    }
    if (status !== undefined) existingProject.status = status;
    if (progress !== undefined) existingProject.progress = Number(progress);

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: existingProject
    });
  } catch (error) {
    console.error('[Update Project Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project owned by the authenticated user
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const deletedProject = await Project.findOneAndDelete({ _id: id, user: userId });
      if (!deletedProject) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or you do not have permission to delete it'
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Project deleted successfully',
        data: deletedProject
      });
    }

    const projectIndex = projects.findIndex((p) => p.id === id);
    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Project not found with id: ${id}`
      });
    }

    const [deletedProject] = projects.splice(projectIndex, 1);
    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      data: deletedProject
    });
  } catch (error) {
    console.error('[Delete Project Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
});

export default router;
