const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Opportunity name is required'],
    trim: true,
  },
  provider: {
    type: String,
    required: [true, 'Provider / Organization is required'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Opportunity type is required'],
    enum: [
      'Scholarship',
      'Fellowship',
      'Grant',
      'Government Funding',
      'Research Funding',
      'Startup Funding',
      'Other',
    ],
  },
  description: {
    type: String,
    default: '',
  },
  fundingAmount: {
    type: Number,
    default: 0,
  },
  fundingType: {
    type: String,
    enum: ['Full Funding', 'Partial Funding', 'Fixed Amount', 'Variable Amount'],
    default: 'Fixed Amount',
  },
  openingDate: {
    type: Date,
    default: null,
  },
  deadline: {
    type: Date,
    required: [true, 'Application deadline is required'],
  },
  officialUrl: {
    type: String,
    required: [true, 'Official application URL is required'],
    trim: true,
  },
  country: {
    type: String,
    default: 'India',
  },
  state: {
    type: String,
    default: 'All',
  },
  eligibleLocations: {
    type: [String],
    default: ['All'],
  },
  educationLevels: {
    type: [String],
    default: ['Any'],
  },
  fields: {
    type: [String],
    default: ['Any'],
  },
  minimumPercentage: {
    type: Number,
    default: 0,
  },
  minAge: {
    type: Number,
    default: 0,
  },
  maxAge: {
    type: Number,
    default: 100,
  },
  incomeLimit: {
    type: Number,
    default: 0, // 0 indicates no upper income ceiling
  },
  genderEligibility: {
    type: String,
    enum: ['Any', 'Male', 'Female', 'Other/Specified'],
    default: 'Any',
  },
  categoryEligibility: {
    type: [String],
    default: ['Any'],
  },
  nationalityEligibility: {
    type: [String],
    default: ['Indian', 'Any'],
  },
  skills: {
    type: [String],
    default: [],
  },
  interests: {
    type: [String],
    default: [],
  },
  fundingPurpose: {
    type: [String],
    default: ['Any'],
  },
  requiredDocuments: {
    type: [String],
    default: [],
  },
  numberOfAwards: {
    type: Number,
    default: null,
  },
  contactInformation: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Expired'],
    default: 'Published',
  },
  isSample: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to automatically mark as expired if deadline is in the past
opportunitySchema.methods.checkExpiry = function () {
  if (this.status !== 'Draft' && this.deadline && new Date(this.deadline) < new Date()) {
    this.status = 'Expired';
  }
  return this.status;
};

module.exports = mongoose.model('Opportunity', opportunitySchema);
