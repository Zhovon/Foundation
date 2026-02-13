const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB
 */
async function connectDatabase() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grantwise';

        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        logger.info('MongoDB connected successfully');

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            logger.info('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        logger.error('MongoDB connection failed:', error.message);
        // Don't exit process - allow app to run without database for now
        // In production, you might want to exit: process.exit(1);
    }
}

module.exports = { connectDatabase };
