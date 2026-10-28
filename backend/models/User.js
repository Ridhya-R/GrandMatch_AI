const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  phone: {
    type: String,
    default: '',
  },
  age: {
    type: Number,
    default: null,
  },
  gender: {
    type: String,
    enum: ['Any', 'Male', 'Female', 'Other/Specified', 'Other', ''],
    default: 'Any',
  },
  country: {
    type: String,
    default: 'India',
  },
  state: {
    type: String,
    default: '',
  },
  district: {
    type: String,
    default: '',
  },
  educationLevel: {
    type: String,
    default: '',
  },
  course: {
    type: String,
    default: '',
  },
  institution: {
    type: String,
    default: '',
  },
  percentage: {
    type: Number,
    default: null,
  },
  skills: {
    type: [String],
    default: [],
  },
  interests: {
    type: [String],
    default: [],
  },
  annualIncome: {
    type: Number,
    default: null,
  },
  category: {
    type: String,
    default: 'General',
  },
  nationality: {
    type: String,
    default: 'Indian',
  },
  employmentStatus: {
    type: String,
    default: 'Student',
  },
  userType: {
    type: String,
    enum: ['Student', 'Researcher', 'Entrepreneur', 'Startup', 'Professional', 'Other', ''],
    default: 'Student',
  },
  fundingPurpose: {
    type: String,
    enum: ['Education', 'Research', 'Startup', 'Business', 'Fellowship', 'Other', ''],
    default: 'Education',
  },
  requiredAmount: {
    type: Number,
    default: null,
  },
  preferredLocation: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
