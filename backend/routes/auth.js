import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Dsa, { DEFAULT_DSA_TOPICS } from '../models/Dsa.js';
import { memoryUsers, generateId } from '../data/store.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Generate signed JWT
 */
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'careeros_super_secret_jwt_key_2025_secure_token';
  return jwt.sign({ id: String(userId) }, secret, { expiresIn: '7d' });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    // 1. Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Check MongoDB persistence if connected
    if (mongoose.connection.readyState === 1) {
      // Check if user exists in MongoDB
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists'
        });
      }

      // Create user (User model hashes password via bcryptjs pre-save hook)
      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: password
      });

      // Initialize default DSA topics for the new user
      try {
        const initialTopics = DEFAULT_DSA_TOPICS.map((item) => ({
          ...item,
          user: user._id
        }));
        await Dsa.insertMany(initialTopics);
      } catch (dsaErr) {
        console.warn('[CareerOS Auth] Default DSA topics init notice:', dsaErr.message);
      }

      // Generate JWT token
      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    }

    // 3. Fallback: In-memory store when MongoDB is disconnected/pending whitelist
    const memoryExisting = memoryUsers.find((u) => u.email === normalizedEmail);
    if (memoryExisting) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    // Securely hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newId = generateId('usr');
    const newMemoryUser = {
      id: newId,
      _id: newId,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword, // Hashed with bcrypt, never plain text
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    memoryUsers.push(newMemoryUser);

    const token = generateToken(newMemoryUser.id);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: newMemoryUser.id,
        name: newMemoryUser.name,
        email: newMemoryUser.email,
        createdAt: newMemoryUser.createdAt,
        updatedAt: newMemoryUser.updatedAt
      }
    });
  } catch (error) {
    console.error('[CareerOS Auth Register Error]:', error.message);

    // MongoDB duplicate key error code
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    // Mongoose schema validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ') || 'Validation failed'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Registration failed due to a server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get JWT token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // 1. Check MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: normalizedEmail }).select('+password');

      if (user) {
        const isMatch = await user.comparePassword(password);
        if (isMatch) {
          const token = generateToken(user._id);
          return res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            token,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt
            }
          });
        }
      }
    }

    // 2. Check in-memory store
    const memUser = memoryUsers.find((u) => u.email === normalizedEmail);
    if (memUser) {
      const isMatch = await bcrypt.compare(password, memUser.password);
      if (isMatch) {
        const token = generateToken(memUser.id);
        return res.status(200).json({
          success: true,
          message: 'Logged in successfully',
          token,
          user: {
            id: memUser.id,
            name: memUser.name,
            email: memUser.email,
            createdAt: memUser.createdAt,
            updatedAt: memUser.updatedAt
          }
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  } catch (error) {
    console.error('[CareerOS Auth Login Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Login failed due to a server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user's profile
 * @access  Private (JWT protected)
 */
router.get('/me', protect, async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: req.user.toSafeUser ? req.user.toSafeUser() : {
        id: req.user.id || req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('[CareerOS Auth Me Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: error.message
    });
  }
});

export default router;
