import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ──────────────────────────────────────────────────────────────────────────────
// protect — verifies JWT and attaches req.user (full user object) to the request
// ──────────────────────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in to continue.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach userId for legacy compatibility
    req.userId = decoded.id;

    // Attach full user object for controllers that need name/email/etc.
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists. Please log in again.',
      });
    }
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid token. Please log in again.',
    });
  }
};

export { protect };
export default protect;
