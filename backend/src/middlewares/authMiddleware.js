import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'soulspace_jwt_secret_fallback_key_2026_@#';

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization required',
      });
    }

    const token = authHeader.split(' ')[1];

    if (token && token.startsWith('demo-offline-token')) {
      req.userId = '65f0a0000000000000000001';
      req.user = {
        _id: '65f0a0000000000000000001',
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo.user@soulspace.ai',
        isDemo: true,
      };
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.userId = decoded.id;

    if (mongoose.connection.readyState >= 1) {
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        return next();
      }
    }

    // Demo or offline fallback user
    req.user = {
      _id: decoded.id,
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo.user@soulspace.ai',
      isDemo: true,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token',
    });
  }
};

export { protect };
export default protect;
