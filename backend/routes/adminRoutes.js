const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const Application = require('../models/Application');
const SavedOpportunity = require('../models/SavedOpportunity');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { sampleOpportunities } = require('../utils/seedData');

// Ensure all routes in this file require Admin authorization
router.use(requireAuth, requireAdmin);

// @route   GET /api/admin/stats
// @desc    Retrieve system-wide metrics and category distributions
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalOpportunities = await Opportunity.countDocuments();
    const activeOpportunities = await Opportunity.countDocuments({ status: 'Published' });
    const expiredOpportunities = await Opportunity.countDocuments({ status: 'Expired' });
    const draftOpportunities = await Opportunity.countDocuments({ status: 'Draft' });

    // Breakdown by type
    const scholarships = await Opportunity.countDocuments({ type: 'Scholarship' });
    const fellowships = await Opportunity.countDocuments({ type: 'Fellowship' });
    const grants = await Opportunity.countDocuments({ type: 'Grant' });
    const governmentFunding = await Opportunity.countDocuments({ type: 'Government Funding' });
    const researchFunding = await Opportunity.countDocuments({ type: 'Research Funding' });
    const startupFunding = await Opportunity.countDocuments({ type: 'Startup Funding' });
    const otherFunding = await Opportunity.countDocuments({ type: 'Other' });

    const totalApplications = await Application.countDocuments();
    const totalSaved = await SavedOpportunity.countDocuments();

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalOpportunities,
        activeOpportunities,
        expiredOpportunities,
        draftOpportunities,
        totalApplications,
        totalSaved,
        byType: {
          Scholarships: scholarships,
          Fellowships: fellowships,
          Grants: grants,
          GovernmentFunding: governmentFunding,
          ResearchFunding: researchFunding,
          StartupFunding: startupFunding,
          Other: otherFunding,
        },
      },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin statistics.',
      error: err.message,
    });
  }
});

// @route   GET /api/admin/opportunities
// @desc    Get all opportunities with admin metadata (including drafts and expired)
router.get('/opportunities', async (req, res) => {
  try {
    const opportunities = await Opportunity.find().sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: opportunities.length,
      opportunities,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load opportunities.',
      error: err.message,
    });
  }
});

// @route   POST /api/admin/opportunities
// @desc    Add a new funding opportunity (with validation)
router.post('/opportunities', async (req, res) => {
  try {
    const {
      name,
      provider,
      type,
      description,
      fundingAmount,
      fundingType,
      openingDate,
      deadline,
      officialUrl,
      country,
      state,
      eligibleLocations,
      educationLevels,
      fields,
      minimumPercentage,
      minAge,
      maxAge,
      incomeLimit,
      genderEligibility,
      categoryEligibility,
      nationalityEligibility,
      skills,
      interests,
      fundingPurpose,
      requiredDocuments,
      numberOfAwards,
      contactInformation,
      notes,
      status = 'Published',
    } = req.body;

    // Strict validation
    if (!name || !provider || !type || !deadline || !officialUrl) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Opportunity Name, Provider, Type, Deadline, and Official URL are required.',
      });
    }

    // URL format check
    try {
      new URL(officialUrl);
    } catch (_) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Official URL must be a valid, formatted URL (e.g. https://...).',
      });
    }

    const newOpp = await Opportunity.create({
      name: name.trim(),
      provider: provider.trim(),
      type,
      description: description || '',
      fundingAmount: fundingAmount !== undefined ? Number(fundingAmount) : 0,
      fundingType: fundingType || 'Fixed Amount',
      openingDate: openingDate ? new Date(openingDate) : null,
      deadline: new Date(deadline),
      officialUrl: officialUrl.trim(),
      country: country || 'India',
      state: state || 'All',
      eligibleLocations: Array.isArray(eligibleLocations) ? eligibleLocations : (eligibleLocations ? eligibleLocations.split(',').map(s => s.trim()) : ['All']),
      educationLevels: Array.isArray(educationLevels) ? educationLevels : (educationLevels ? educationLevels.split(',').map(s => s.trim()) : ['Any']),
      fields: Array.isArray(fields) ? fields : (fields ? fields.split(',').map(s => s.trim()) : ['Any']),
      minimumPercentage: minimumPercentage !== undefined ? Number(minimumPercentage) : 0,
      minAge: minAge !== undefined ? Number(minAge) : 0,
      maxAge: maxAge !== undefined ? Number(maxAge) : 100,
      incomeLimit: incomeLimit !== undefined ? Number(incomeLimit) : 0,
      genderEligibility: genderEligibility || 'Any',
      categoryEligibility: Array.isArray(categoryEligibility) ? categoryEligibility : (categoryEligibility ? categoryEligibility.split(',').map(s => s.trim()) : ['Any']),
      nationalityEligibility: Array.isArray(nationalityEligibility) ? nationalityEligibility : (nationalityEligibility ? nationalityEligibility.split(',').map(s => s.trim()) : ['Indian', 'Any']),
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
      interests: Array.isArray(interests) ? interests : (interests ? interests.split(',').map(s => s.trim()) : []),
      fundingPurpose: Array.isArray(fundingPurpose) ? fundingPurpose : (fundingPurpose ? fundingPurpose.split(',').map(s => s.trim()) : ['Any']),
      requiredDocuments: Array.isArray(requiredDocuments) ? requiredDocuments : (requiredDocuments ? requiredDocuments.split(',').map(s => s.trim()) : []),
      numberOfAwards: numberOfAwards !== undefined ? Number(numberOfAwards) : null,
      contactInformation: contactInformation || '',
      notes: notes || '',
      status: new Date(deadline) < new Date() && status !== 'Draft' ? 'Expired' : status,
    });

    return res.status(201).json({
      success: true,
      message: 'Opportunity successfully added.',
      opportunity: newOpp,
    });
  } catch (err) {
    console.error('Add opportunity error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to add opportunity.',
      error: err.message,
    });
  }
});

// @route   PUT /api/admin/opportunities/:id
// @desc    Update existing opportunity
router.put('/opportunities/:id', async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found.',
      });
    }

    const updates = { ...req.body, updatedAt: new Date() };

    // Format array strings if provided as comma-separated
    const arrayFields = ['eligibleLocations', 'educationLevels', 'fields', 'categoryEligibility', 'nationalityEligibility', 'skills', 'interests', 'fundingPurpose', 'requiredDocuments'];
    for (const field of arrayFields) {
      if (typeof updates[field] === 'string') {
        updates[field] = updates[field].split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    // Auto-expiry logic check
    if (updates.deadline && new Date(updates.deadline) < new Date() && updates.status !== 'Draft') {
      updates.status = 'Expired';
    }

    const updated = await Opportunity.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    return res.json({
      success: true,
      message: 'Opportunity updated successfully.',
      opportunity: updated,
    });
  } catch (err) {
    console.error('Update opportunity error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update opportunity.',
      error: err.message,
    });
  }
});

// @route   DELETE /api/admin/opportunities/:id
// @desc    Delete an opportunity
router.delete('/opportunities/:id', async (req, res) => {
  try {
    const deleted = await Opportunity.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found.',
      });
    }

    // Also clean up user saved bookmarks and applications
    await SavedOpportunity.deleteMany({ opportunityId: req.params.id });
    await Application.deleteMany({ opportunityId: req.params.id });

    return res.json({
      success: true,
      message: 'Opportunity and associated tracking records successfully deleted.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete opportunity.',
      error: err.message,
    });
  }
});

// @route   POST /api/admin/auto-expire
// @desc    Scan and mark all opportunities with passed deadlines as Expired
router.post('/auto-expire', async (req, res) => {
  try {
    const now = new Date();
    const result = await Opportunity.updateMany(
      {
        deadline: { $lt: now },
        status: { $ne: 'Draft' },
      },
      {
        $set: { status: 'Expired', updatedAt: now },
      }
    );

    return res.json({
      success: true,
      message: `Checked deadlines. ${result.modifiedCount} opportunities updated to 'Expired'.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error executing auto-expiry routine.',
      error: err.message,
    });
  }
});

// @route   GET /api/admin/users
// @desc    List all registered users with profiles
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load users.',
      error: err.message,
    });
  }
});

// @route   POST /api/admin/seed-reset
// @desc    Reset and re-populate sample opportunities
router.post('/seed-reset', async (req, res) => {
  try {
    for (const oppData of sampleOpportunities) {
      await Opportunity.findOneAndUpdate(
        { name: oppData.name },
        oppData,
        { upsert: true, new: true }
      );
    }
    return res.json({
      success: true,
      message: 'Sample opportunities re-synchronized successfully.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to sync sample data.',
      error: err.message,
    });
  }
});

module.exports = router;
