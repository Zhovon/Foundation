const logger = require('../utils/logger');

/**
 * Authentication middleware
 * Checks if user is logged in
 */
exports.requireAuth = (req, res, next) => {
    if (!req.session.user) {
        req.flash('error', 'Please log in to access this page');
        return res.redirect('/login');
    }
    next();
};

/**
 * Check if user is already logged in
 * Redirect to dashboard if yes
 */
exports.redirectIfAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    next();
};

/**
 * Attach user to response locals
 * Makes user available in all templates
 */
exports.attachUser = (req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
};

/**
 * Check subscription tier
 * @param {string} requiredTier - Minimum required tier
 */
exports.requireTier = (requiredTier) => {
    const tierLevels = {
        free: 0,
        starter: 1,
        professional: 2,
        team: 3
    };

    return async (req, res, next) => {
        try {
            if (!req.session.user) {
                req.flash('error', 'Please log in');
                return res.redirect('/login');
            }

            const { supabase } = require('../config/supabase');
            const { data: user } = await supabase
                .from('users')
                .select('subscription_tier')
                .eq('id', req.session.user.id)
                .single();

            const userTierLevel = tierLevels[user?.subscription_tier || 'free'];
            const requiredTierLevel = tierLevels[requiredTier];

            if (userTierLevel < requiredTierLevel) {
                req.flash('error', `This feature requires ${requiredTier} plan or higher`);
                return res.redirect('/pricing');
            }

            next();
        } catch (error) {
            logger.error('Tier check error:', error.message);
            next(error);
        }
    };
};

/**
 * Check usage limits
 */
exports.checkUsageLimit = async (req, res, next) => {
    try {
        if (!req.session.user) {
            return next();
        }

        const { supabase } = require('../config/supabase');
        const { data: user } = await supabase
            .from('users')
            .select('subscription_tier, proposals_this_month')
            .eq('id', req.session.user.id)
            .single();

        const limits = {
            free: 1,
            starter: 5,
            professional: Infinity,
            team: Infinity
        };

        const limit = limits[user?.subscription_tier || 'free'];
        const used = user?.proposals_this_month || 0;

        if (used >= limit) {
            req.flash('error', `You've reached your monthly limit of ${limit} proposal${limit > 1 ? 's' : ''}. Upgrade to generate more!`);
            return res.redirect('/pricing');
        }

        next();
    } catch (error) {
        logger.error('Usage limit check error:', error.message);
        next(error);
    }
};
