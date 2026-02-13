const { generateProposal, analyzeOrganizationVoice, refineProposal } = require('../services/openaiService');
const { checkCompliance } = require('../services/guidelinesParser');
const logger = require('../utils/logger');

/**
 * Show the proposal generation form
 */
exports.showGeneratorForm = (req, res) => {
    res.render('pages/generate', {
        title: 'Generate Proposal - GrantWise AI',
        currentStep: 1
    });
};

/**
 * Handle proposal generation
 */
exports.generateProposal = async (req, res, next) => {
    try {
        const projectData = {
            organizationName: req.body.organizationName,
            projectName: req.body.projectName,
            mission: req.body.mission,
            problem: req.body.problem,
            activities: req.body.activities,
            targetPopulation: req.body.targetPopulation,
            duration: req.body.duration,
            outcomes: req.body.outcomes,
            budget: req.body.budget,
            metrics: req.body.metrics,
            guidelines: req.body.guidelines,
            organizationVoice: req.body.organizationVoice || ''
        };

        logger.info('Proposal generation requested', {
            projectName: projectData.projectName,
            organizationName: projectData.organizationName
        });

        // Generate the proposal
        const result = await generateProposal(projectData);

        // Check compliance
        const complianceReport = checkCompliance(result.proposal, result.parsedGuidelines);

        // Store in session for later access
        req.session.lastProposal = {
            proposal: result.proposal,
            projectData,
            parsedGuidelines: result.parsedGuidelines,
            complianceReport,
            metadata: result.metadata,
            generatedAt: new Date()
        };

        // Return JSON for AJAX requests
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({
                success: true,
                proposal: result.proposal,
                complianceReport,
                redirectUrl: '/result'
            });
        }

        // Redirect to results page
        res.redirect('/result');
    } catch (error) {
        logger.error('Error in generateProposal controller:', error.message);

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({
                success: false,
                error: error.message || 'Failed to generate proposal'
            });
        }

        req.flash('error', error.message || 'Failed to generate proposal');
        res.redirect('/generate');
    }
};

/**
 * Show the results page
 */
exports.showResults = async (req, res) => {
    const lastProposal = req.session.lastProposal;

    if (!lastProposal) {
        req.flash('error', 'No proposal found. Please generate a proposal first.');
        return res.redirect('/generate');
    }

    // Find matching grants
    let matchingGrants = [];
    try {
        const { findMatchingGrants } = require('../services/grantsService');
        matchingGrants = await findMatchingGrants(lastProposal.projectData);
    } catch (error) {
        logger.error('Error finding matching grants:', error.message);
        // Continue without grants if there's an error
    }

    res.render('pages/result', {
        title: 'Your Proposal - GrantWise AI',
        proposal: lastProposal.proposal,
        projectName: lastProposal.projectData.projectName,
        organizationName: lastProposal.projectData.organizationName,
        generatedAt: lastProposal.generatedAt,
        complianceReport: lastProposal.complianceReport || null,
        parsedGuidelines: lastProposal.parsedGuidelines || null,
        matchingGrants: matchingGrants.slice(0, 5) // Top 5 matches
    });
};

/**
 * Analyze organization voice (AJAX endpoint)
 */
exports.analyzeVoice = async (req, res) => {
    try {
        const { pastProposals } = req.body;

        if (!pastProposals || pastProposals.trim().length < 100) {
            return res.status(400).json({
                success: false,
                error: 'Please provide at least 100 characters of past proposals'
            });
        }

        const analysis = await analyzeOrganizationVoice(pastProposals);

        res.json({
            success: true,
            analysis: analysis.analysis
        });
    } catch (error) {
        logger.error('Error analyzing voice:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze organization voice'
        });
    }
};

/**
 * Refine proposal (AJAX endpoint)
 */
exports.refineProposalEndpoint = async (req, res) => {
    try {
        const { instruction } = req.body;
        const lastProposal = req.session.lastProposal;

        if (!lastProposal) {
            return res.status(400).json({
                success: false,
                error: 'No proposal found in session'
            });
        }

        if (!instruction || instruction.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please provide refinement instructions'
            });
        }

        const refinedProposal = await refineProposal(lastProposal.proposal, instruction);

        // Update session with refined proposal
        req.session.lastProposal.proposal = refinedProposal;

        res.json({
            success: true,
            proposal: refinedProposal
        });
    } catch (error) {
        logger.error('Error refining proposal:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to refine proposal'
        });
    }
};

