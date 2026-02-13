const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');
const { proposalValidation, validate } = require('../middleware/validation');
const { proposalLimiter } = require('../middleware/rateLimiter');

// Landing page
router.get('/', (req, res) => {
    res.render('pages/index', {
        title: 'GrantWise AI - AI-Powered Grant Proposals for Nonprofits'
    });
});

// Pricing page
router.get('/pricing', (req, res) => {
    res.render('pages/pricing', {
        title: 'Pricing - GrantWise AI'
    });
});

// Generator form
router.get('/generate', proposalController.showGeneratorForm);

// Generate proposal (with validation and rate limiting)
router.post('/generate',
    proposalLimiter,
    proposalValidation,
    validate,
    proposalController.generateProposal
);

// Results page
router.get('/result', proposalController.showResults);

// Analyze organization voice (AJAX endpoint)
router.post('/api/analyze-voice', proposalController.analyzeVoice);

// Refine proposal (AJAX endpoint)
router.post('/api/refine-proposal', proposalController.refineProposalEndpoint);

// Export routes
const exportController = require('../controllers/exportController');
router.get('/export/word', exportController.exportWord);
router.get('/export/pdf', exportController.exportPDF);
router.get('/export/text', exportController.exportText);

// Grants routes
const grantsController = require('../controllers/grantsController');
router.get('/grants', grantsController.showGrantsPage);
router.get('/grants/:id', grantsController.showGrantDetail);
router.get('/api/grants/search', grantsController.searchGrants);
router.get('/api/grants/:id', grantsController.getGrantDetails);
router.get('/api/grants/matches', grantsController.findMatches);

module.exports = router;
