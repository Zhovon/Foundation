const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');
const authController = require('../controllers/authController');
const { proposalValidation, validate } = require('../middleware/validation');
const { proposalLimiter } = require('../middleware/rateLimiter');
const { requireAuth, redirectIfAuthenticated, attachUser } = require('../middleware/auth');

// Global middleware - attach user to all requests
router.use(attachUser);

// Landing page
router.get('/', (req, res) => {
    res.render('pages/index', {
        title: 'GrantWise AI - AI-Powered Grant Proposals for Nonprofits'
    });
});

// Authentication routes
router.get('/signup', redirectIfAuthenticated, (req, res) => {
    res.render('pages/signup');
});
router.post('/auth/signup', authController.signup);

router.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('pages/login');
});
router.post('/auth/login', authController.login);

router.get('/logout', authController.logout);

router.get('/forgot-password', redirectIfAuthenticated, (req, res) => {
    res.render('pages/forgot-password');
});
router.post('/auth/forgot-password', authController.forgotPassword);

router.get('/reset-password', (req, res) => {
    res.render('pages/reset-password', { token: req.query.token });
});
router.post('/auth/reset-password', authController.resetPassword);

// Protected routes (require authentication)
router.get('/dashboard', requireAuth, authController.showDashboard);

router.get('/profile', requireAuth, (req, res) => {
    res.render('pages/profile');
});
router.post('/auth/update-profile', requireAuth, authController.updateProfile);
router.post('/auth/change-password', requireAuth, authController.changePassword);
router.get('/auth/delete-account', requireAuth, authController.deleteAccount);

// Google OAuth
router.get('/auth/google', authController.googleAuth);
router.get('/auth/google/callback', authController.googleCallback);


// Pricing page
router.get('/pricing', (req, res) => {
    res.render('pages/pricing', {
        title: 'Pricing - GrantWise AI'
    });
});

// Legal pages
router.get('/terms', (req, res) => {
    res.render('pages/terms', { title: 'Terms of Service - GrantWise AI' });
});

router.get('/privacy-policy', (req, res) => {
    res.render('pages/privacy', { title: 'Privacy Policy - GrantWise AI' });
});

router.get('/refund-policy', (req, res) => {
    res.render('pages/refund', { title: 'Refund Policy - GrantWise AI' });
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

// Payment routes (Paddle)
const paymentController = require('../controllers/paymentController');
router.post('/api/payment/checkout', paymentController.createCheckout);
router.post('/api/payment/webhook', paymentController.handleWebhook);
router.post('/api/payment/cancel', paymentController.cancelSubscription);
router.get('/api/payment/portal', paymentController.getCustomerPortal);
router.get('/payment/success', paymentController.showPaymentSuccess);

module.exports = router;
