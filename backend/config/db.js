const mongoose = require('mongoose');

let memoryServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/grantmatch';
  
  // Try connecting to primary MongoDB instance with short timeout
  try {
    console.log(`[DB] Attempting connection to MongoDB at: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log('[DB] ✓ Successfully connected to MongoDB Daemon');
    return;
  } catch (err) {
    console.warn(`[DB] Could not connect to local MongoDB daemon (${err.message}). Initializing embedded database fallback...`);
  }

  // Graceful fallback to mongodb-memory-server
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServerInstance = await MongoMemoryServer.create();
    const memUri = memoryServerInstance.getUri();
    console.log(`[DB] Starting embedded MongoMemoryServer at: ${memUri}`);
    await mongoose.connect(memUri);
    console.log('[DB] ✓ Successfully connected to Embedded MongoDB Instance');
  } catch (memErr) {
    console.error('[DB] Failed to initialize embedded MongoDB instance:', memErr.message);
    throw memErr;
  }
};

module.exports = connectDB;
