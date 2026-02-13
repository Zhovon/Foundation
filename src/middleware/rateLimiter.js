const rateLimit = require('express-rate-limit');
const { RATE_LIMITS } = require('../config/constants');

// General rate limiter for all routes
const generalLimiter = rateLimit({
    windowMs: RATE_LIMITS.windowMs,
    max: RATE_LIMITS.maxRequests,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

// Strict rate limiter for proposal generation
const proposalLimiter = rateLimit({
    windowMs: RATE_LIMITS.windowMs,
    max: RATE_LIMITS.maxProposalRequests,
    message: 'Too many proposal requests. Please wait before generating more proposals.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false
});

// Auth rate limiter (stricter for login/signup)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    generalLimiter,
    proposalLimiter,
    authLimiter
};
