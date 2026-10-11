import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { memoryUsers } from '../data/store.js';

/**
 * Middleware to verify JWT authentication token in Authorization header
 * Expected format: Authorization: Bearer <token>
 */
export const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  const jwtSecret = process.env.JWT_SECRET || 'careeros_super_secret_jwt_key_2025_secure_token';

  try {
    const decoded = jwt.verify(token, jwtSecret);

    let user = null;

    // Check MongoDB if connected
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(decoded.id)) {
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (dbErr) {
        console.warn('[CareerOS AuthMiddleware] DB findById lookup fallback:', dbErr.message);
      }
    }

    // Check memoryUsers if not found in MongoDB
    if (!user) {
      const memUser = memoryUsers.find(
        (u) => String(u.id) === String(decoded.id) || String(u._id) === String(decoded.id)
      );
      if (memUser) {
        user = {
          ...memUser,
          id: memUser.id || memUser._id,
          _id: memUser._id || memUser.id,
          toSafeUser: () => ({
            id: memUser.id || memUser._id,
            name: memUser.name,
            email: memUser.email,
            createdAt: memUser.createdAt,
            updatedAt: memUser.updatedAt
          })
        };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: User no longer exists.'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid or corrupted authentication token.'
    });
  }
};

export default protect;
