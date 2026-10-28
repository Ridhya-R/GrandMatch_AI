const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const { requireAuth } = require('../middleware/auth');
const { calculateMatch } = require('../utils/matcher');

router.use(requireAuth);

// @route   GET /api/applications
// @desc    Retrieve all applications tracked by the current user
router.get('/', async (req, res) => {
  try {
    const apps = await Application.find({ userId: req.user._id })
      .populate('opportunityId')
      .sort({ updatedAt: -1 });

    const now = new Date();
    const result = apps
      .filter((app) => app.opportunityId)
      .map((app) => {
        const opp = app.opportunityId.toObject ? app.opportunityId.toObject() : app.opportunityId;
        const deadlineDate = new Date(opp.deadline);
        const isPast = deadlineDate < now;
        const diffTime = deadlineDate - now;
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const matchData = calculateMatch(req.user, opp);

        return {
          _id: app._id,
          status: app.status,
          notes: app.notes,
          appliedDate: app.appliedDate,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt,
          opportunity: {
            ...opp,
            isExpired: isPast || opp.status === 'Expired',
            daysRemaining: isPast ? 0 : daysRemaining,
            eligibilityMatch: matchData.matchPercentage,
          },
        };
      });

    return res.json({
      success: true,
      count: result.length,
      applications: result,
    });
  } catch (err) {
    console.error('Fetch applications error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve applications.',
      error: err.message,
    });
  }
});

// @route   POST /api/applications
// @desc    Create or update application status for an opportunity
router.post('/', async (req, res) => {
  try {
    const { opportunityId, status = 'Planning to Apply', notes = '', appliedDate } = req.body;

    if (!opportunityId) {
      return res.status(400).json({
        success: false,
        message: 'Opportunity ID is required.',
      });
    }

    const opp = await Opportunity.findById(opportunityId);
    if (!opp) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found.',
      });
    }

    let app = await Application.findOne({
      userId: req.user._id,
      opportunityId,
    });

    if (app) {
      app.status = status;
      if (notes !== undefined) app.notes = notes;
      if (appliedDate) app.appliedDate = new Date(appliedDate);
      if (status === 'Submitted' && !app.appliedDate) app.appliedDate = new Date();
      app.updatedAt = new Date();
      await app.save();
    } else {
      app = await Application.create({
        userId: req.user._id,
        opportunityId,
        status,
        notes,
        appliedDate: status === 'Submitted' ? (appliedDate ? new Date(appliedDate) : new Date()) : null,
      });
    }

    return res.json({
      success: true,
      message: `Application status updated to "${status}".`,
      application: app,
    });
  } catch (err) {
    console.error('Update application error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to save application status.',
      error: err.message,
    });
  }
});

// @route   PUT /api/applications/:id
// @desc    Update an existing application by ID
router.put('/:id', async (req, res) => {
  try {
    const { status, notes, appliedDate } = req.body;
    const app = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'Application record not found.',
      });
    }

    if (status) app.status = status;
    if (notes !== undefined) app.notes = notes;
    if (appliedDate) app.appliedDate = new Date(appliedDate);
    if (status === 'Submitted' && !app.appliedDate) app.appliedDate = new Date();
    app.updatedAt = new Date();

    await app.save();

    return res.json({
      success: true,
      message: 'Application updated successfully.',
      application: app,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update application.',
      error: err.message,
    });
  }
});

// @route   DELETE /api/applications/:id
// @desc    Delete an application tracking record
router.delete('/:id', async (req, res) => {
  try {
    await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    return res.json({
      success: true,
      message: 'Application tracking record deleted.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete application tracking record.',
      error: err.message,
    });
  }
});

module.exports = router;
