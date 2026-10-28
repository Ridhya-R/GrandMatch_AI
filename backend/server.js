require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { seedDatabase } = require('./utils/seedData');
const Opportunity = require('./models/Opportunity');

const authRoutes = require('./routes/authRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const adminRoutes = require('./routes/adminRoutes');
const savedRoutes = require('./routes/savedRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().substring(11, 19)}] ${req.method} ${req.url}`);
  next();
});

// Periodic auto-expiry check
const runAutoExpiryCheck = async () => {
  try {
    const now = new Date();
    const result = await Opportunity.updateMany(
      {
        deadline: { $lt: now },
        status: { $nin: ['Draft', 'Expired'] },
      },
      {
        $set: { status: 'Expired', updatedAt: now },
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`[AUTO-EXPIRY] Marked ${result.modifiedCount} opportunities as Expired.`);
    }
  } catch (err) {
    console.error('[AUTO-EXPIRY] Error during periodic check:', err.message);
  }
};

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    service: 'GrantMatch REST API',
    aiIntegrated: true,
    engine: 'Deterministic Rule-Based Matching + Decision Tree ML Ranking',
    aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    note: 'ML ranking is advisory. Eligibility determined by deterministic engine.',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Initialize database, seed data, and start server
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();
    await runAutoExpiryCheck();

    // Run auto-expiry check every 15 minutes
    setInterval(runAutoExpiryCheck, 15 * 60 * 1000);

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  GrantMatch Backend Server running on port ${PORT}`);
      console.log(`  API Endpoint: http://localhost:${PORT}/api`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Critical failure during server startup:', err);
    process.exit(1);
  }
};

startServer();
