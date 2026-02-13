const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

// Initialize Gemini client
let geminiClient = null;

function getGeminiClient() {
    if (!geminiClient) {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            logger.error('GEMINI_API_KEY or GOOGLE_API_KEY is not set in environment variables');
            throw new Error('Gemini API key is not configured');
        }

        geminiClient = new GoogleGenerativeAI(apiKey);
        logger.info('Gemini client initialized successfully');
    }

    return geminiClient;
}

module.exports = {
    getGeminiClient
};
