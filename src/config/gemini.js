const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const logger = require('../utils/logger');

// Initialize Gemini client
let geminiClient = null;
let geminiModelValidated = false;

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

async function checkGeminiModelConfiguration() {
    if (geminiModelValidated) {
        return;
    }

    geminiModelValidated = true;

    const configuredModel = (process.env.GEMINI_MODEL || '').trim();
    if (!configuredModel) {
        return;
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        logger.warn('Skipping GEMINI_MODEL validation because Gemini API key is not configured');
        return;
    }

    try {
        const response = await axios.get('https://generativelanguage.googleapis.com/v1beta/models', {
            params: { key: apiKey },
            timeout: 8000
        });

        const models = Array.isArray(response.data?.models) ? response.data.models : [];
        const normalizedName = configuredModel.startsWith('models/')
            ? configuredModel
            : `models/${configuredModel}`;

        const matchedModel = models.find((model) => model.name === normalizedName);

        if (!matchedModel) {
            logger.warn('Configured GEMINI_MODEL was not found in ListModels response', {
                configuredModel,
                hint: 'Use a currently supported model such as gemini-1.5-flash'
            });
            return;
        }

        const supportedMethods = matchedModel.supportedGenerationMethods || [];
        if (!supportedMethods.includes('generateContent')) {
            logger.warn('Configured GEMINI_MODEL does not support generateContent', {
                configuredModel,
                supportedMethods
            });
            return;
        }

        logger.info('Configured GEMINI_MODEL is valid', {
            configuredModel
        });
    } catch (error) {
        logger.warn('Unable to validate GEMINI_MODEL at startup', {
            configuredModel,
            error: error.message
        });
    }
}

module.exports = {
    getGeminiClient,
    checkGeminiModelConfiguration
};
