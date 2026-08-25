import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper: sign JWT token
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Helper: build safe user response (no password)
const buildUserResponse = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  username: user.username || (user.email ? user.email.split('@')[0] : 'soul_seeker'),
  email: user.email,
  phone: user.phone || '',
  bio: user.bio || 'On a journey toward mental clarity and mindful living with SoulSpace.',
  emergencyContact: user.emergencyContact || { name: '', phone: '', relation: '' },
  isDemo: user.isDemo || false,
  assessmentResults: user.assessmentResults || [],
  moodLogs: user.moodLogs || [],
  createdAt: user.createdAt,
});

// =============================================================
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// =============================================================
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: firstName, lastName, email, password.',
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please sign in instead.',
      });
    }

    // Create user
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      password,
    });

    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      message: `Welcome to SoulSpace, ${firstName}! Your account has been created.`,
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error('Register Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.',
    });
  }
};

// =============================================================
// @route   POST /api/auth/login
// @desc    Login user with email & password
// @access  Public
// =============================================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Find user (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email. Please check your email or sign up.',
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.',
      });
    }

    const token = signToken(user._id);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.firstName}!`,
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.',
    });
  }
};

// =============================================================
// @route   POST /api/auth/demo-login
// @desc    1-Click Demo Login — auto creates/returns demo user
// @access  Public
// =============================================================
export const demoLogin = async (req, res) => {
  try {
    const DEMO_EMAIL = 'demo.user@soulspace.ai';
    const DEMO_PASSWORD = 'DemoPassword123!';

    // Find existing demo user
    let demoUser = await User.findOne({ email: DEMO_EMAIL });

    if (!demoUser) {
      // Create demo user with plain password — pre-save hook will hash it
      demoUser = await User.create({
        firstName: 'Demo',
        lastName: 'User',
        email: DEMO_EMAIL,
        phone: '+91 98765 43210',
        password: DEMO_PASSWORD,
        isDemo: true,
      });
    }

    const token = signToken(demoUser._id);

    return res.status(200).json({
      success: true,
      message: '👋 Welcome to SoulSpace Demo! Explore all features freely.',
      token,
      user: buildUserResponse(demoUser),
    });
  } catch (error) {
    console.error('Demo Login Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Demo login failed. Please try again.',
    });
  }
};

// =============================================================
// @route   GET /api/auth/me
// @desc    Get current logged-in user info (protected)
// @access  Private (JWT required)
// =============================================================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({ success: true, user: buildUserResponse(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// =============================================================
// @route   PUT /api/auth/profile
// @desc    Update user profile (name, username, phone, bio, emergency contact)
// @access  Private (JWT required)
// =============================================================
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, username, bio, emergencyContact } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (username) {
      user.username = username.replace(/^@/, '').trim().toLowerCase();
    }
    if (bio !== undefined) user.bio = bio.trim();
    if (emergencyContact) {
      user.emergencyContact = {
        name: emergencyContact.name || '',
        phone: emergencyContact.phone || '',
        relation: emergencyContact.relation || '',
      };
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

// =============================================================
// @route   POST /api/auth/mood
// @desc    Log mood entry to user profile
// @access  Private (JWT required)
// =============================================================
export const logMood = async (req, res) => {
  try {
    const { mood, level, emoji, type, confidence, note, date, time } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const newLog = {
      mood,
      level,
      emoji,
      type: type || 'Manual Selection',
      confidence: confidence || '',
      note: note || '',
      date: date || 'Today',
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      loggedAt: new Date(),
    };

    user.moodLogs.push(newLog);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Mood saved to profile!',
      moodLog: newLog,
      moodLogs: user.moodLogs,
    });
  } catch (error) {
    console.error('Log Mood Error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to log mood.' });
  }
};

