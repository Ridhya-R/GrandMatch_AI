const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const { optionalAuth } = require('../middleware/auth');
const { calculateMatch } = require('../utils/matcher');

// Disclaimer constant to accompany all recommendation outputs
const MATCH_DISCLAIMER = 'GrantMatch provides funding opportunity information and eligibility matching based on available criteria. It does not award funding or guarantee selection. Users should verify current eligibility, deadlines and application requirements with the official funding provider.';

// @route   GET /api/opportunities
// @desc    Retrieve all active/published opportunities with search & filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      type,
      educationLevel,
      fundingType,
      fundingPurpose,
      location,
      minAmount,
      maxAmount,
      status = 'Published',
      sort = 'newest',
    } = req.query;

    const query = {};

    // Filter by status (default Published for public catalog)
    if (status && status !== 'All') {
      query.status = status;
    }

    // Keyword search across title, provider, description, fields
    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { provider: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { fields: { $regex: term, $options: 'i' } },
        { eligibleLocations: { $regex: term, $options: 'i' } },
      ];
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    if (fundingType && fundingType !== 'All') {
      query.fundingType = fundingType;
    }

    if (educationLevel && educationLevel !== 'All') {
      query.educationLevels = { $in: [educationLevel, 'Any'] };
    }

    if (fundingPurpose && fundingPurpose !== 'All') {
      query.fundingPurpose = { $in: [fundingPurpose, 'Any'] };
    }

    if (location && location !== 'All') {
      query.$or = [
        ...(query.$or || []),
        { country: { $regex: location, $options: 'i' } },
        { state: { $regex: location, $options: 'i' } },
        { eligibleLocations: { $in: [location, 'All'] } },
      ];
    }

    if (minAmount || maxAmount) {
      query.fundingAmount = {};
      if (minAmount) query.fundingAmount.$gte = Number(minAmount);
      if (maxAmount) query.fundingAmount.$lte = Number(maxAmount);
    }

    const opportunities = await Opportunity.find(query).lean();
    const now = new Date();

    // Compute deadline days remaining and match score if user is logged in
    const processed = opportunities.map((opp) => {
      const deadlineDate = new Date(opp.deadline);
      const isPast = deadlineDate < now;
      const diffTime = deadlineDate - now;
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let matchData = null;
      if (req.user) {
        matchData = calculateMatch(req.user, opp);
      }

      return {
        ...opp,
        isExpired: isPast || opp.status === 'Expired',
        daysRemaining: isPast ? 0 : daysRemaining,
        eligibilityMatch: matchData ? matchData.matchPercentage : null,
        reasons: matchData ? matchData.reasons : [],
        gaps: matchData ? matchData.gaps : [],
      };
    });

    // Sorting
    if (sort === 'deadline') {
      processed.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    } else if (sort === 'amount-desc') {
      processed.sort((a, b) => (b.fundingAmount || 0) - (a.fundingAmount || 0));
    } else if (sort === 'amount-asc') {
      processed.sort((a, b) => (a.fundingAmount || 0) - (b.fundingAmount || 0));
    } else if (sort === 'match' && req.user) {
      processed.sort((a, b) => (b.eligibilityMatch || 0) - (a.eligibilityMatch || 0));
    } else {
      // Default: newest
      processed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.json({
      success: true,
      count: processed.length,
      disclaimer: MATCH_DISCLAIMER,
      opportunities: processed,
    });
  } catch (err) {
    console.error('Fetch opportunities error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve opportunities.',
      error: err.message,
    });
  }
});

// @route   POST /api/opportunities/match
// @desc    Calculate rule-based match scores based on user profile or custom requirements form
router.post('/match', optionalAuth, async (req, res) => {
  try {
    // User profile either passed in body or merged with logged-in user
    const criteria = {
      ...(req.user ? req.user.toObject ? req.user.toObject() : req.user : {}),
      ...req.body,
    };

    const opportunities = await Opportunity.find({
      status: 'Published',
    }).lean();

    const now = new Date();
    const evaluated = [];

    for (const opp of opportunities) {
      const deadlineDate = new Date(opp.deadline);
      const isPast = deadlineDate < now;
      const diffTime = deadlineDate - now;
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Calculate rule-based match
      const matchResult = calculateMatch(criteria, opp);

      evaluated.push({
        ...opp,
        isExpired: isPast,
        daysRemaining: isPast ? 0 : daysRemaining,
        eligibilityMatch: matchResult.matchPercentage,
        score: matchResult.score,
        reasons: matchResult.reasons,
        gaps: matchResult.gaps,
        breakdown: matchResult.breakdown,
      });
    }

    // Sort by highest match percentage first, then by deadline
    evaluated.sort((a, b) => {
      if (b.eligibilityMatch !== a.eligibilityMatch) {
        return b.eligibilityMatch - a.eligibilityMatch;
      }
      return new Date(a.deadline) - new Date(b.deadline);
    });

    return res.json({
      success: true,
      totalMatched: evaluated.length,
      disclaimer: MATCH_DISCLAIMER,
      criteriaEvaluated: criteria,
      opportunities: evaluated,
    });
  } catch (err) {
    console.error('Matching engine error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error computing eligibility matches.',
      error: err.message,
    });
  }
});

// @route   GET /api/opportunities/:id
// @desc    Get detailed single opportunity information
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id).lean();
    if (!opp) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found.',
      });
    }

    const now = new Date();
    const deadlineDate = new Date(opp.deadline);
    const isPast = deadlineDate < now;
    const diffTime = deadlineDate - now;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let matchData = null;
    if (req.user) {
      matchData = calculateMatch(req.user, opp);
    }

    return res.json({
      success: true,
      disclaimer: MATCH_DISCLAIMER,
      opportunity: {
        ...opp,
        isExpired: isPast || opp.status === 'Expired',
        daysRemaining: isPast ? 0 : daysRemaining,
        eligibilityMatch: matchData ? matchData.matchPercentage : null,
        reasons: matchData ? matchData.reasons : [],
        gaps: matchData ? matchData.gaps : [],
        breakdown: matchData ? matchData.breakdown : [],
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load opportunity details.',
      error: err.message,
    });
  }
});

module.exports = router;
