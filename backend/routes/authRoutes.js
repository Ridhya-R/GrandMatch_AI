const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user account
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'user',
      phone,
      age,
      gender,
      country,
      state,
      district,
      educationLevel,
      course,
      institution,
      percentage,
      skills,
      interests,
      annualIncome,
      category,
      nationality,
      employmentStatus,
      userType,
      fundingPurpose,
      requiredAmount,
      preferredLocation,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase().trim (),
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'user',
      phone: phone || '',
      age: age ? Number(age) : null,
      gender: gender || 'Any',
      country: country || 'India',
      state: state || '',
      district: district || '',
      educationLevel: educationLevel || '',
      course: course || '',
      institution: institution || '',
      percentage: percentage !== undefined && percentage !== '' ? Number(percentage) : null,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
      interests: Array.isArray(interests) ? interests : (interests ? interests.split(',').map(s => s.trim()) : []),
      annualIncome: annualIncome !== undefined && annualIncome !== '' ? Number(annualIncome) : null,
      category: category || 'General',
      nationality: nationality || 'Indian',
      employmentStatus: employmentStatus || 'Student',
      userType: userType || 'Student',
      fundingPurpose: fundingPurpose || 'Education',
      requiredAmount: requiredAmount ? Number(requiredAmount) : null,
      preferredLocation: preferredLocation || '',
    });

    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to GrantMatch.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        educationLevel: user.educationLevel,
        course: user.course,
        percentage: user.percentage,
        annualIncome: user.annualIncome,
        fundingPurpose: user.fundingPurpose,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration.',
      error: err.message,
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and retrieve token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No user found with this email.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    const token = signToken(user._id);

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        educationLevel: user.educationLevel,
        course: user.course,
        percentage: user.percentage,
        annualIncome: user.annualIncome,
        fundingPurpose: user.fundingPurpose,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.',
      error: err.message,
    });
  }
});

// @route   GET /api/auth/me
// @desc    Retrieve full authenticated user profile
router.get('/me', requireAuth, async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
});

// @route   PUT /api/auth/profile
// @desc    Update user profile & criteria
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const allowedFields = [
      'name',
      'phone',
      'age',
      'gender',
      'country',
      'state',
      'district',
      'educationLevel',
      'course',
      'institution',
      'percentage',
      'skills',
      'interests',
      'annualIncome',
      'category',
      'nationality',
      'employmentStatus',
      'userType',
      'fundingPurpose',
      'requiredAmount',
      'preferredLocation',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'skills' || field === 'interests') {
          updates[field] = Array.isArray(req.body[field])
            ? req.body[field]
            : String(req.body[field]).split(',').map(s => s.trim()).filter(Boolean);
        } else if (['age', 'percentage', 'annualIncome', 'requiredAmount'].includes(field)) {
          updates[field] = req.body[field] !== '' && req.body[field] !== null
            ? Number(req.body[field])
            : null;
        } else {
          updates[field] = req.body[field];
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
      error: err.message,
    });
  }
});

// @route   POST /api/auth/demo-login
// @desc    Instant demo login helper (Admin or Student User)
router.post('/demo-login', async (req, res) => {
  try {
    const { role = 'user' } = req.body;
    const email = role === 'admin' ? 'admin@grantmatch.org' : 'user@grantmatch.org';

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Demo account (${email}) not found. Please trigger database seed.`,
      });
    }

    const token = signToken(user._id);

    return res.json({
      success: true,
      message: `Logged in as Demo ${role.toUpperCase()}`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        educationLevel: user.educationLevel,
        course: user.course,
        percentage: user.percentage,
        annualIncome: user.annualIncome,
        fundingPurpose: user.fundingPurpose,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Demo login failed.',
      error: err.message,
    });
  }
});

module.exports = router;
