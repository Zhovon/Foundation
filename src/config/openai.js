const OpenAI = require('openai');
const logger = require('../utils/logger');

// Initialize OpenAI client
let openaiClient = null;

function getOpenAIClient() {
    if (!openaiClient) {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            logger.error('OPENAI_API_KEY is not set in environment variables');
            throw new Error('OpenAI API key is not configured');
        }

        openaiClient = new OpenAI({
            apiKey: apiKey
        });

        logger.info('OpenAI client initialized successfully');
    }

    return openaiClient;
}

module.exports = {
    getOpenAIClient
};
