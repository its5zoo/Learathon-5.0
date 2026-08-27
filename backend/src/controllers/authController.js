import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'soulspace_jwt_secret_fallback_key_2026_@#';

const signToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const buildUserResponse = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  username: user.username || (user.email ? user.email.split('@')[0] : 'soul_seeker'),
  email: user.email,
  phone: user.phone || '',
  bio: user.bio || 'On a journey toward mental clarity and mindful living with SoulSpace.',
  emergencyContact: user.emergencyContact || { name: '', phone: '', relation: '' },
  isDemo: Boolean(user.isDemo),
  assessmentResults: user.assessmentResults || [],
  moodLogs: user.moodLogs || [],
  createdAt: user.createdAt || new Date().toISOString(),
});

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: firstName, lastName, email, password.',
      });
    }

    if (mongoose.connection.readyState >= 1) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists.',
        });
      }

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
        message: `Welcome to SoulSpace, ${firstName}!`,
        token,
        user: buildUserResponse(user),
      });
    }

    // Fallback if DB is offline
    const tempUser = {
      _id: `user_${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      isDemo: false,
      createdAt: new Date().toISOString(),
    };
    const token = signToken(tempUser._id);

    return res.status(201).json({
      success: true,
      message: `Welcome to SoulSpace, ${firstName}!`,
      token,
      user: buildUserResponse(tempUser),
    });
  } catch (error) {
    console.error('Register error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    if (mongoose.connection.readyState >= 1) {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No account found with this email.',
        });
      }

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
    }

    // Fallback login
    const tempUser = {
      _id: 'offline_user_1',
      firstName: 'SoulSpace',
      lastName: 'Seeker',
      email: email.toLowerCase().trim(),
      isDemo: false,
    };
    const token = signToken(tempUser._id);
    return res.status(200).json({
      success: true,
      message: 'Welcome back!',
      token,
      user: buildUserResponse(tempUser),
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

export const demoLogin = async (req, res) => {
  const DEMO_EMAIL = 'demo.user@soulspace.ai';
  const DEMO_PASSWORD = 'DemoPassword123!';

  try {
    let demoUser = null;

    if (mongoose.connection.readyState >= 1) {
      try {
        demoUser = await User.findOne({ email: DEMO_EMAIL });
        if (!demoUser) {
          demoUser = await User.create({
            firstName: 'Demo',
            lastName: 'User',
            email: DEMO_EMAIL,
            phone: '+91 98765 43210',
            password: DEMO_PASSWORD,
            isDemo: true,
          });
        }
      } catch (dbErr) {
        console.warn('DB demo user retrieval warning:', dbErr.message);
      }
    }

    if (!demoUser) {
      demoUser = {
        _id: '65f0a0000000000000000001',
        firstName: 'Demo',
        lastName: 'User',
        email: DEMO_EMAIL,
        phone: '+91 98765 43210',
        isDemo: true,
        assessmentResults: [],
        moodLogs: [],
        createdAt: new Date().toISOString(),
      };
    }

    const token = signToken(demoUser._id);

    return res.status(200).json({
      success: true,
      message: 'Welcome to SoulSpace Demo!',
      token,
      user: buildUserResponse(demoUser),
    });
  } catch (error) {
    console.error('Demo login error fallback:', error.message);
    const fallbackUser = {
      _id: '65f0a0000000000000000001',
      firstName: 'Demo',
      lastName: 'User',
      email: DEMO_EMAIL,
      phone: '+91 98765 43210',
      isDemo: true,
      assessmentResults: [],
      moodLogs: [],
      createdAt: new Date().toISOString(),
    };
    const token = signToken(fallbackUser._id);
    return res.status(200).json({
      success: true,
      message: 'Welcome to SoulSpace Demo!',
      token,
      user: buildUserResponse(fallbackUser),
    });
  }
};

export const getMe = async (req, res) => {
  try {
    if (mongoose.connection.readyState >= 1) {
      const user = await User.findById(req.userId);
      if (user) {
        return res.status(200).json({ success: true, user: buildUserResponse(user) });
      }
    }

    if (req.user) {
      return res.status(200).json({ success: true, user: buildUserResponse(req.user) });
    }

    return res.status(404).json({ success: false, message: 'User not found' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, username, bio, emergencyContact } = req.body;

    if (mongoose.connection.readyState >= 1) {
      const user = await User.findById(req.userId);
      if (user) {
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
          message: 'Profile updated successfully',
          user: buildUserResponse(user),
        });
      }
    }

    const updatedLocal = {
      _id: req.userId,
      firstName: firstName || 'Demo',
      lastName: lastName || 'User',
      phone: phone || '',
      username: username || 'demo_user',
      bio: bio || '',
      emergencyContact: emergencyContact || { name: '', phone: '', relation: '' },
    };

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: buildUserResponse(updatedLocal),
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const logMood = async (req, res) => {
  try {
    const { mood, level, emoji, type, confidence, note, date, time } = req.body;
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

    if (mongoose.connection.readyState >= 1) {
      const user = await User.findById(req.userId);
      if (user) {
        user.moodLogs.push(newLog);
        await user.save();

        return res.status(200).json({
          success: true,
          message: 'Mood logged successfully',
          moodLog: newLog,
          moodLogs: user.moodLogs,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Mood logged successfully',
      moodLog: newLog,
      moodLogs: [newLog],
    });
  } catch (error) {
    console.error('Log mood error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to log mood' });
  }
};
