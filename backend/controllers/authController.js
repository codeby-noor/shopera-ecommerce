const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_apextech_2026_portfolio_secure_token';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// @desc    Register a new customer
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Hash password with salt 10
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default avatar
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0d6efd&color=fff&size=200`;

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, phone, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), normalizedEmail, hashedPassword, 'user', phone ? phone.trim() : null, defaultAvatar]
    );

    const newUserId = result.insertId;

    const userObj = {
      id: newUserId,
      name: name.trim(),
      email: normalizedEmail,
      role: 'user',
      phone: phone ? phone.trim() : null,
      avatar_url: defaultAvatar
    };

    const token = generateToken(userObj);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: userObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const userObj = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar_url: user.avatar_url,
      created_at: user.created_at
    };

    const token = generateToken(userObj);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: userObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, phone, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.json({
      success: true,
      user: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar_url } = req.body;
    const userId = req.user.id;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long.'
      });
    }

    await db.query(
      'UPDATE users SET name = ?, phone = ?, avatar_url = ? WHERE id = ?',
      [name.trim(), phone ? phone.trim() : null, avatar_url || req.user.avatar_url, userId]
    );

    const [updated] = await db.query(
      'SELECT id, name, email, role, phone, avatar_url, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.'
      });
    }

    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
    const user = rows[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Initiate password recovery (Safe token-based demo flow)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [rows] = await db.query('SELECT id, name, email FROM users WHERE email = ?', [normalizedEmail]);

    if (rows.length === 0) {
      // Safe response to prevent user enumeration
      return res.json({
        success: true,
        message: 'If an account exists with this email, instructions have been generated.'
      });
    }

    const user = rows[0];
    // Generate a temporary reset token valid for 30 minutes
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, purpose: 'pwd_reset' },
      JWT_SECRET,
      { expiresIn: '30m' }
    );

    res.json({
      success: true,
      message: 'Recovery link generated successfully. For this sandbox portfolio, the recovery token is provided below.',
      demoResetToken: resetToken,
      userEmail: user.email
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete password reset with recovery token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Recovery token and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.purpose !== 'pwd_reset') {
        return res.status(400).json({ success: false, message: 'Invalid password recovery token.' });
      }
    } catch (jwtErr) {
      return res.status(400).json({
        success: false,
        message: 'Recovery token is invalid or has expired. Please request a new recovery link.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, decoded.id]);

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};
