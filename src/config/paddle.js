const { Paddle } = require('@paddle/paddle-node-sdk');
const logger = require('../utils/logger');

/**
 * Paddle client configuration
 */

const paddleApiKey = process.env.PADDLE_API_KEY;
const paddleEnvironment = process.env.NODE_ENV === 'production' ? 'production' : 'sandbox';

if (!paddleApiKey) {
    logger.warn('Paddle API key not configured. Payment features will be disabled.');
}

// Initialize Paddle client
const paddle = paddleApiKey ? new Paddle(paddleApiKey, {
    environment: paddleEnvironment
}) : null;

/**
 * Get Paddle client instance
 * @returns {Object} Paddle client
 */
function getPaddleClient() {
    if (!paddle) {
        throw new Error('Paddle is not configured');
    }
    return paddle;
}

/**
 * Paddle product IDs for subscription tiers
 */
const PADDLE_PRODUCTS = {
    starter: process.env.PADDLE_PRODUCT_STARTER || 'pri_starter',
    professional: process.env.PADDLE_PRODUCT_PROFESSIONAL || 'pri_professional',
    team: process.env.PADDLE_PRODUCT_TEAM || 'pri_team'
};

/**
 * Get product ID for subscription tier
 * @param {string} tier - Subscription tier
 * @returns {string} Paddle product ID
 */
function getProductIdForTier(tier) {
    return PADDLE_PRODUCTS[tier] || null;
}

module.exports = {
    paddle,
    getPaddleClient,
    getProductIdForTier,
    PADDLE_PRODUCTS
};
