const { getGeminiClient } = require('../config/gemini');
const { parseGuidelines } = require('./guidelinesParser');
const logger = require('../utils/logger');

// Gemini model configuration
const GEMINI_MODEL = 'gemini-1.5-flash'; // Free tier model
const MAX_OUTPUT_TOKENS = 8000;

/**
 * Generate a grant proposal using Google Gemini
 * @param {Object} projectData - Project information
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} - Generated proposal and metadata
 */
async function generateProposal(projectData, options = {}) {
    try {
        const client = getGeminiClient();
        const model = client.getGenerativeModel({ model: GEMINI_MODEL });

        // Parse guidelines for better compliance
        const parsedGuidelines = parseGuidelines(projectData.guidelines);

        // Build the prompt with parsed guidelines
        const prompt = buildProposalPrompt(projectData, parsedGuidelines);

        logger.info('Generating proposal with Gemini', {
            projectName: projectData.projectName,
            model: GEMINI_MODEL,
            wordLimit: parsedGuidelines.wordLimit
        });

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                maxOutputTokens: MAX_OUTPUT_TOKENS,
                temperature: 0.7,
            },
        });

        const response = result.response;
        const proposal = response.text();

        logger.info('Proposal generated successfully', {
            projectName: projectData.projectName,
            model: GEMINI_MODEL
        });

        return {
            proposal,
            parsedGuidelines,
            metadata: {
                model: GEMINI_MODEL,
                generatedAt: new Date()
            }
        };
    } catch (error) {
        logger.error('Error generating proposal:', {
            error: error.message,
            projectName: projectData.projectName
        });
        throw new Error('Failed to generate proposal. Please try again.');
    }
}

/**
 * Build the prompt for proposal generation
 * @param {Object} data - Project data
 * @param {Object} parsedGuidelines - Parsed guidelines
 * @returns {string} - Formatted prompt
 */
function buildProposalPrompt(data, parsedGuidelines) {
    let prompt = `You are an expert grant writer with 20+ years of experience helping nonprofits secure funding. You write compelling, persuasive proposals that follow funder guidelines precisely while showcasing the unique impact of each organization.\n\n`;

    prompt += `Please write a compelling grant proposal based on the following information:\n\n`;

    prompt += `ORGANIZATION: ${data.organizationName}\n\n`;
    prompt += `PROJECT NAME: ${data.projectName}\n\n`;
    prompt += `MISSION: ${data.mission}\n\n`;
    prompt += `PROBLEM STATEMENT: ${data.problem}\n\n`;
    prompt += `PROPOSED ACTIVITIES: ${data.activities}\n\n`;
    prompt += `TARGET POPULATION: ${data.targetPopulation}\n\n`;
    prompt += `PROJECT DURATION: ${data.duration}\n\n`;
    prompt += `EXPECTED OUTCOMES: ${data.outcomes}\n\n`;
    prompt += `BUDGET: ${data.budget}\n\n`;
    prompt += `SUCCESS METRICS: ${data.metrics}\n\n`;
    prompt += `GRANT GUIDELINES:\n${data.guidelines}\n\n`;

    // Add parsed requirements
    if (parsedGuidelines.wordLimit) {
        prompt += `IMPORTANT: The proposal must not exceed ${parsedGuidelines.wordLimit} words.\n\n`;
    }

    if (parsedGuidelines.requiredSections.length > 0) {
        prompt += `REQUIRED SECTIONS: ${parsedGuidelines.requiredSections.join(', ')}\n\n`;
    }

    // Add organization voice if provided
    if (data.organizationVoice && data.organizationVoice.trim()) {
        prompt += `ORGANIZATION VOICE SAMPLES (match this tone and style):\n${data.organizationVoice}\n\n`;
    }

    prompt += `Please create a professional grant proposal that:\n`;
    prompt += `1. Follows the grant guidelines exactly\n`;
    prompt += `2. Uses persuasive, compelling language\n`;
    prompt += `3. Clearly demonstrates impact and need\n`;
    prompt += `4. Includes all required sections from the guidelines\n`;
    prompt += `5. Maintains a professional, confident tone\n`;

    if (parsedGuidelines.wordLimit) {
        prompt += `6. Stays within the ${parsedGuidelines.wordLimit} word limit\n`;
    }

    if (data.organizationVoice && data.organizationVoice.trim()) {
        prompt += `7. Matches the organization's unique voice and writing style\n`;
    }

    prompt += `\nFormat the proposal with clear headings and sections.`;

    return prompt;
}

/**
 * Analyze organization voice from past proposals
 * @param {string} pastProposals - Past successful proposals
 * @returns {Promise<Object>} - Voice analysis
 */
async function analyzeOrganizationVoice(pastProposals) {
    try {
        const client = getGeminiClient();
        const model = client.getGenerativeModel({ model: GEMINI_MODEL });

        logger.info('Analyzing organization voice');

        const prompt = `You are an expert in analyzing writing styles and organizational voice. Identify key characteristics, tone, vocabulary patterns, and unique phrases.\n\nAnalyze the writing style and voice in these past grant proposals:\n\n${pastProposals}\n\nProvide a detailed analysis of:\n1. Tone (formal, conversational, passionate, etc.)\n2. Common vocabulary and phrases\n3. Sentence structure patterns\n4. Unique characteristics\n5. Key themes and values`;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                maxOutputTokens: 2000,
                temperature: 0.5,
            },
        });

        const analysis = result.response.text();

        logger.info('Voice analysis completed');

        return {
            analysis,
            rawSamples: pastProposals
        };
    } catch (error) {
        logger.error('Error analyzing organization voice:', error.message);
        throw new Error('Failed to analyze organization voice');
    }
}

/**
 * Refine an existing proposal with AI
 * @param {string} proposal - Existing proposal
 * @param {string} instruction - Refinement instruction
 * @returns {Promise<string>} - Refined proposal
 */
async function refineProposal(proposal, instruction) {
    try {
        const client = getGeminiClient();
        const model = client.getGenerativeModel({ model: GEMINI_MODEL });

        logger.info('Refining proposal with instruction:', instruction);

        const prompt = `You are an expert grant writer helping to refine and improve grant proposals.\n\nHere is a grant proposal:\n\n${proposal}\n\nPlease ${instruction}\n\nReturn the complete refined proposal.`;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                maxOutputTokens: MAX_OUTPUT_TOKENS,
                temperature: 0.7,
            },
        });

        const refinedProposal = result.response.text();

        logger.info('Proposal refined successfully');

        return refinedProposal;
    } catch (error) {
        logger.error('Error refining proposal:', error.message);
        throw new Error('Failed to refine proposal');
    }
}

module.exports = {
    generateProposal,
    analyzeOrganizationVoice,
    refineProposal
};
