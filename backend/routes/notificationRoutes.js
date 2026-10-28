const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const SavedOpportunity = require('../models/SavedOpportunity');
const Opportunity = require('../models/Opportunity');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// @route   GET /api/notifications
// @desc    Get user notifications (auto-syncing upcoming deadlines)
router.get('/', async (req, res) => {
  try {
    const now = new Date();

    // Check user's saved opportunities for impending deadlines
    const saved = await SavedOpportunity.find({ userId: req.user._id }).populate('opportunityId');
    for (const item of saved) {
      if (!item.opportunityId) continue;
      const opp = item.opportunityId;
      const deadlineDate = new Date(opp.deadline);
      const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));

      if (diffDays > 0 && diffDays <= 15) {
        const title = `Deadline Alert: ${opp.name}`;
        const existing = await Notification.findOne({
          userId: req.user._id,
          title,
          createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }, // Don't duplicate in 24h
        });

        if (!existing) {
          await Notification.create({
            userId: req.user._id,
            title,
            message: `Only ${diffDays} days remaining to apply for "${opp.name}" (Deadline: ${deadlineDate.toLocaleDateString()}).`,
            type: 'deadline',
          });
        }
      }
    }

    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false,
    });

    return res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (err) {
    console.error('Fetch notifications error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications.',
      error: err.message,
    });
  }
});

// @route   PATCH /api/notifications/:id/read
// @desc    Mark a single notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true }
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// @route   PATCH /api/notifications/read-all
// @desc    Mark all user notifications as read
router.patch('/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id }, { read: true });
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
