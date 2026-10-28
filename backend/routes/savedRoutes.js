const express = require('express');
const router = express.Router();
const SavedOpportunity = require('../models/SavedOpportunity');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const { requireAuth } = require('../middleware/auth');
const { calculateMatch } = require('../utils/matcher');

router.use(requireAuth);

// @route   GET /api/saved
// @desc    Get user's bookmarked opportunities with computed match score and status
router.get('/', async (req, res) => {
  try {
    const saved = await SavedOpportunity.find({ userId: req.user._id })
      .populate('opportunityId')
      .sort({ savedAt: -1 });

    const now = new Date();
    const result = [];

    for (const item of saved) {
      if (!item.opportunityId) continue;
      const opp = item.opportunityId.toObject ? item.opportunityId.toObject() : item.opportunityId;

      const deadlineDate = new Date(opp.deadline);
      const isPast = deadlineDate < now;
      const diffTime = deadlineDate - now;
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Fetch any existing application status for this opportunity
      const app = await Application.findOne({
        userId: req.user._id,
        opportunityId: opp._id,
      });

      const matchData = calculateMatch(req.user, opp);

      result.push({
        _id: item._id,
        savedAt: item.savedAt,
        opportunity: {
          ...opp,
          isExpired: isPast || opp.status === 'Expired',
          daysRemaining: isPast ? 0 : daysRemaining,
          eligibilityMatch: matchData.matchPercentage,
          reasons: matchData.reasons,
          gaps: matchData.gaps,
        },
        applicationStatus: app ? app.status : 'Not Started',
        applicationNotes: app ? app.notes : '',
        applicationId: app ? app._id : null,
      });
    }

    return res.json({
      success: true,
      count: result.length,
      saved: result,
    });
  } catch (err) {
    console.error('Fetch saved error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load saved opportunities.',
      error: err.message,
    });
  }
});

// @route   POST /api/saved/:opportunityId
// @desc    Bookmark an opportunity (or unbookmark if already saved)
router.post('/:opportunityId', async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.opportunityId);
    if (!opp) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found.',
      });
    }

    const existing = await SavedOpportunity.findOne({
      userId: req.user._id,
      opportunityId: opp._id,
    });

    if (existing) {
      // Toggle off / remove
      await SavedOpportunity.findByIdAndDelete(existing._id);
      return res.json({
        success: true,
        isSaved: false,
        message: 'Removed from saved opportunities.',
      });
    } else {
      // Add bookmark
      await SavedOpportunity.create({
        userId: req.user._id,
        opportunityId: opp._id,
      });
      return res.json({
        success: true,
        isSaved: true,
        message: 'Opportunity successfully saved to your bookmarks.',
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update saved opportunity.',
      error: err.message,
    });
  }
});

// @route   DELETE /api/saved/:opportunityId
// @desc    Explicitly remove an opportunity bookmark
router.delete('/:opportunityId', async (req, res) => {
  try {
    await SavedOpportunity.findOneAndDelete({
      userId: req.user._id,
      opportunityId: req.params.opportunityId,
    });

    return res.json({
      success: true,
      message: 'Bookmark removed.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to remove bookmark.',
      error: err.message,
    });
  }
});

module.exports = router;
