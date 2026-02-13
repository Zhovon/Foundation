const {
    searchGrants: searchGrantsService,
    getGrantDetails: getGrantDetailsService,
    findMatchingGrants: findMatchingGrantsService
} = require('../services/grantsService');
const logger = require('../utils/logger');

/**
 * Search for grants
 */
exports.searchGrants = async (req, res) => {
    try {
        const {
            keyword = '',
            category = '',
            eligibility = '25', // Nonprofits by default
            rows = 25,
            page = 1
        } = req.query;

        const startRecordNum = (page - 1) * rows;

        const grants = await searchGrantsService({
            keyword,
            category,
            eligibility,
            rows: parseInt(rows),
            startRecordNum
        });

        res.json({
            success: true,
            grants,
            page: parseInt(page),
            totalResults: grants.length
        });

    } catch (error) {
        logger.error('Error in searchGrants controller:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to search grants'
        });
    }
};

/**
 * Get grant details
 */
exports.getGrantDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const grant = await getGrantDetailsService(id);

        res.json({
            success: true,
            grant
        });

    } catch (error) {
        logger.error('Error in getGrantDetails controller:', error.message);
        res.status(404).json({
            success: false,
            error: 'Grant not found'
        });
    }
};

/**
 * Find matching grants for current project
 */
exports.findMatches = async (req, res) => {
    try {
        const lastProposal = req.session.lastProposal;

        if (!lastProposal) {
            return res.status(400).json({
                success: false,
                error: 'No project data found. Please generate a proposal first.'
            });
        }

        const matches = await findMatchingGrantsService(lastProposal.projectData);

        res.json({
            success: true,
            matches,
            totalMatches: matches.length
        });

    } catch (error) {
        logger.error('Error finding matching grants:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to find matching grants'
        });
    }
};

/**
 * Show grants search page
 */
exports.showGrantsPage = (req, res) => {
    res.render('pages/grants', {
        title: 'Find Grants - GrantWise AI'
    });
};

/**
 * Show grant detail page
 */
exports.showGrantDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const grant = await getGrantDetailsService(id);

        res.render('pages/grant-detail', {
            title: `${grant.title} - GrantWise AI`,
            grant
        });

    } catch (error) {
        logger.error('Error showing grant detail:', error.message);
        req.flash('error', 'Grant not found');
        res.redirect('/grants');
    }
};
