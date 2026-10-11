import express from 'express';
import mongoose from 'mongoose';
import Goal from '../models/Goal.js';
import { goals, generateId } from '../data/store.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all goal routes
router.use(protect);

/**
 * @route   GET /api/goals
 * @desc    Get all goals for the authenticated user
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      const userGoals = await Goal.find({ user: userId }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: userGoals.length,
        data: userGoals
      });
    }

    const userGoals = goals.filter((g) => String(g.user) === String(userId) || !g.user);
    return res.status(200).json({
      success: true,
      count: userGoals.length,
      data: userGoals
    });
  } catch (error) {
    console.error('[Get Goals Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve goals',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/goals
 * @desc    Create a new goal for the authenticated user
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      task, 
      text, 
      description = '', 
      deadline = 'Today', 
      category = 'Learning', 
      priority = 'Medium', 
      completed = false 
    } = req.body;

    const userId = req.user._id || req.user.id;
    const goalTitle = title || task || text;

    if (!goalTitle || typeof goalTitle !== 'string' || !goalTitle.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Goal title is required and cannot be empty'
      });
    }

    if (mongoose.connection.readyState === 1) {
      const newGoal = await Goal.create({
        user: userId,
        title: goalTitle.trim(),
        task: goalTitle.trim(),
        description: typeof description === 'string' ? description.trim() : '',
        deadline: typeof deadline === 'string' && deadline.trim() ? deadline.trim() : 'Today',
        category: typeof category === 'string' && category.trim() ? category.trim() : 'Learning',
        priority: typeof priority === 'string' && priority.trim() ? priority.trim() : 'Medium',
        completed: Boolean(completed)
      });

      return res.status(201).json({
        success: true,
        message: 'Goal created successfully',
        data: newGoal
      });
    }

    // In-memory fallback
    const newGoal = {
      id: generateId('goal'),
      user: userId,
      title: goalTitle.trim(),
      task: goalTitle.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      deadline: typeof deadline === 'string' && deadline.trim() ? deadline.trim() : 'Today',
      category: typeof category === 'string' && category.trim() ? category.trim() : 'Learning',
      priority: typeof priority === 'string' && priority.trim() ? priority.trim() : 'Medium',
      completed: Boolean(completed),
      createdAt: new Date().toISOString()
    };
    goals.unshift(newGoal);

    return res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: newGoal
    });
  } catch (error) {
    console.error('[Create Goal Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create goal',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/goals/:id
 * @desc    Update an existing goal owned by the authenticated user
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, task, text, description, deadline, category, priority, completed } = req.body;
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const goal = await Goal.findOne({ _id: id, user: userId });
      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found or you do not have permission to modify it'
        });
      }

      const updatedTitle = title !== undefined ? title : (task !== undefined ? task : text);
      if (updatedTitle !== undefined) {
        goal.title = updatedTitle.trim();
        goal.task = updatedTitle.trim();
      }
      if (description !== undefined) goal.description = description.trim();
      if (deadline !== undefined) goal.deadline = deadline.trim();
      if (category !== undefined) goal.category = category.trim();
      if (priority !== undefined) goal.priority = priority.trim();
      if (completed !== undefined) goal.completed = Boolean(completed);

      await goal.save();

      return res.status(200).json({
        success: true,
        message: 'Goal updated successfully',
        data: goal
      });
    }

    const goalIndex = goals.findIndex((g) => g.id === id);
    if (goalIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Goal not found with id: ${id}`
      });
    }

    const existingGoal = goals[goalIndex];
    if (existingGoal.user && String(existingGoal.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this goal'
      });
    }

    const updatedTitle = title !== undefined ? title : (task !== undefined ? task : text);
    if (updatedTitle !== undefined) {
      existingGoal.title = updatedTitle.trim();
      existingGoal.task = updatedTitle.trim();
    }
    if (description !== undefined) existingGoal.description = description.trim();
    if (deadline !== undefined) existingGoal.deadline = deadline.trim();
    if (category !== undefined) existingGoal.category = category.trim();
    if (priority !== undefined) existingGoal.priority = priority.trim();
    if (completed !== undefined) existingGoal.completed = Boolean(completed);

    return res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      data: existingGoal
    });
  } catch (error) {
    console.error('[Update Goal Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update goal',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/goals/:id
 * @desc    Delete a goal owned by the authenticated user
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const deletedGoal = await Goal.findOneAndDelete({ _id: id, user: userId });
      if (!deletedGoal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found or you do not have permission to delete it'
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Goal deleted successfully',
        data: deletedGoal
      });
    }

    const goalIndex = goals.findIndex((g) => g.id === id);
    if (goalIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Goal not found with id: ${id}`
      });
    }

    const [deletedGoal] = goals.splice(goalIndex, 1);
    return res.status(200).json({
      success: true,
      message: 'Goal deleted successfully',
      data: deletedGoal
    });
  } catch (error) {
    console.error('[Delete Goal Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete goal',
      error: error.message
    });
  }
});

export default router;
