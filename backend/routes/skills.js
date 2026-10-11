import express from 'express';
import mongoose from 'mongoose';
import Skill from '../models/Skill.js';
import { skills, generateId } from '../data/store.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all skill routes
router.use(protect);

/**
 * @route   GET /api/skills
 * @desc    Get all skills for the authenticated user
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      const userSkills = await Skill.find({ user: userId }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: userSkills.length,
        data: userSkills
      });
    }

    // In-memory fallback scoped to authenticated user
    const userSkills = skills.filter((s) => String(s.user) === String(userId) || !s.user);
    return res.status(200).json({
      success: true,
      count: userSkills.length,
      data: userSkills
    });
  } catch (error) {
    console.error('[Get Skills Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve skills',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/skills
 * @desc    Create a new skill for the authenticated user
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const { name, category, progress, level, status, color } = req.body;
    const userId = req.user._id || req.user.id;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Skill name is required and must be a non-empty string'
      });
    }

    if (!category || typeof category !== 'string' || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Category is required and must be a non-empty string'
      });
    }

    const rawProgress = progress !== undefined ? progress : (level !== undefined ? level : 0);
    const parsedProgress = Number(rawProgress);

    if (isNaN(parsedProgress) || parsedProgress < 0 || parsedProgress > 100) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Progress must be a number between 0 and 100'
      });
    }

    if (mongoose.connection.readyState === 1) {
      const newSkill = await Skill.create({
        user: userId,
        name: name.trim(),
        category: category.trim(),
        progress: parsedProgress,
        level: parsedProgress,
        status: status || (parsedProgress >= 75 ? 'Proficient' : 'Learning'),
        color: color || '#6366F1'
      });

      return res.status(201).json({
        success: true,
        message: 'Skill created successfully',
        data: newSkill
      });
    }

    // In-memory fallback
    const newSkill = {
      id: generateId('skill'),
      user: userId,
      name: name.trim(),
      category: category.trim(),
      progress: parsedProgress,
      level: parsedProgress,
      status: status || (parsedProgress >= 75 ? 'Proficient' : 'Learning'),
      color: color || '#6366F1',
      createdAt: new Date().toISOString()
    };
    skills.unshift(newSkill);

    return res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: newSkill
    });
  } catch (error) {
    console.error('[Create Skill Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create skill',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/skills/:id
 * @desc    Update an existing skill owned by the authenticated user
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, progress, level, status, color } = req.body;
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const skill = await Skill.findOne({ _id: id, user: userId });

      if (!skill) {
        return res.status(404).json({
          success: false,
          message: 'Skill not found or you do not have permission to modify it'
        });
      }

      if (name !== undefined) skill.name = name.trim();
      if (category !== undefined) skill.category = category.trim();
      const rawProgress = progress !== undefined ? progress : level;
      if (rawProgress !== undefined) {
        skill.progress = Number(rawProgress);
        skill.level = Number(rawProgress);
      }
      if (status !== undefined) skill.status = status;
      if (color !== undefined) skill.color = color;

      await skill.save();

      return res.status(200).json({
        success: true,
        message: 'Skill updated successfully',
        data: skill
      });
    }

    // In-memory fallback
    const skillIndex = skills.findIndex((s) => s.id === id);
    if (skillIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Skill not found with id: ${id}`
      });
    }

    const existingSkill = skills[skillIndex];
    if (existingSkill.user && String(existingSkill.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this skill'
      });
    }

    if (name !== undefined) existingSkill.name = name.trim();
    if (category !== undefined) existingSkill.category = category.trim();
    const rawProgress = progress !== undefined ? progress : level;
    if (rawProgress !== undefined) {
      existingSkill.progress = Number(rawProgress);
      existingSkill.level = Number(rawProgress);
    }
    if (status !== undefined) existingSkill.status = status;
    if (color !== undefined) existingSkill.color = color;

    return res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      data: existingSkill
    });
  } catch (error) {
    console.error('[Update Skill Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update skill',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/skills/:id
 * @desc    Delete a skill owned by the authenticated user
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const deletedSkill = await Skill.findOneAndDelete({ _id: id, user: userId });

      if (!deletedSkill) {
        return res.status(404).json({
          success: false,
          message: 'Skill not found or you do not have permission to delete it'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Skill deleted successfully',
        data: deletedSkill
      });
    }

    // In-memory fallback
    const skillIndex = skills.findIndex((s) => s.id === id);
    if (skillIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Skill not found with id: ${id}`
      });
    }

    const [deletedSkill] = skills.splice(skillIndex, 1);
    return res.status(200).json({
      success: true,
      message: 'Skill deleted successfully',
      data: deletedSkill
    });
  } catch (error) {
    console.error('[Delete Skill Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete skill',
      error: error.message
    });
  }
});

export default router;
