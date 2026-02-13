const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

/**
 * Authentication Controller using Supabase
 */

/**
 * Check if Supabase is configured
 */
function isSupabaseConfigured() {
    return supabase !== null;
}

/**
 * Middleware to check if auth is available
 */
function requireSupabase(req, res, next) {
    if (!isSupabaseConfigured()) {
        req.flash('error', 'Authentication is not configured. Please contact support.');
        return res.redirect('/');
    }
    next();
}

/**
 * Show signup page
 */
exports.showSignup = (req, res) => {
    res.render('pages/signup', {
        title: 'Sign Up - GrantWise AI'
    });
};

/**
 * Show login page
 */
exports.showLogin = (req, res) => {
    res.render('pages/login', {
        title: 'Login - GrantWise AI'
    });
};

/**
 * Handle signup
 */
exports.signup = async (req, res) => {
    try {
        const { email, password, firstName, lastName, organizationName } = req.body;

        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    organization_name: organizationName,
                    subscription_tier: 'free'
                }
            }
        });

        if (error) {
            logger.error('Signup error:', error.message);
            req.flash('error', error.message);
            return res.redirect('/signup');
        }

        // Create user profile in database
        const { error: profileError } = await supabase
            .from('users')
            .insert([{
                id: data.user.id,
                email: data.user.email,
                first_name: firstName,
                last_name: lastName,
                organization_name: organizationName,
                subscription_tier: 'free',
                created_at: new Date().toISOString()
            }]);

        if (profileError) {
            logger.error('Profile creation error:', profileError.message);
        }

        req.flash('success', 'Account created! Please check your email to verify your account.');
        res.redirect('/login');

    } catch (error) {
        logger.error('Signup error:', error.message);
        req.flash('error', 'Failed to create account');
        res.redirect('/signup');
    }
};

/**
 * Handle login
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            logger.error('Login error:', error.message);
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }

        // Store session
        req.session.user = {
            id: data.user.id,
            email: data.user.email,
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token
        };

        logger.info('User logged in', { userId: data.user.id });
        res.redirect('/dashboard');

    } catch (error) {
        logger.error('Login error:', error.message);
        req.flash('error', 'Login failed');
        res.redirect('/login');
    }
};

/**
 * Handle Google OAuth login
 */
exports.googleLogin = async (req, res) => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${process.env.APP_URL || 'http://localhost:3000'}/auth/callback`
            }
        });

        if (error) {
            logger.error('Google OAuth error:', error.message);
            req.flash('error', 'Google login failed');
            return res.redirect('/login');
        }

        res.redirect(data.url);

    } catch (error) {
        logger.error('Google OAuth error:', error.message);
        req.flash('error', 'Google login failed');
        res.redirect('/login');
    }
};

/**
 * Handle OAuth callback
 */
exports.authCallback = async (req, res) => {
    try {
        const { access_token, refresh_token } = req.query;

        if (!access_token) {
            req.flash('error', 'Authentication failed');
            return res.redirect('/login');
        }

        // Get user data
        const { data: { user }, error } = await supabase.auth.getUser(access_token);

        if (error || !user) {
            logger.error('Auth callback error:', error?.message);
            req.flash('error', 'Authentication failed');
            return res.redirect('/login');
        }

        // Store session
        req.session.user = {
            id: user.id,
            email: user.email,
            accessToken: access_token,
            refreshToken: refresh_token
        };

        // Check if user profile exists, create if not
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!profile) {
            // Create profile for OAuth users
            await supabase
                .from('users')
                .insert([{
                    id: user.id,
                    email: user.email,
                    first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
                    last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                    organization_name: '',
                    subscription_tier: 'free',
                    created_at: new Date().toISOString()
                }]);
        }

        res.redirect('/dashboard');

    } catch (error) {
        logger.error('Auth callback error:', error.message);
        req.flash('error', 'Authentication failed');
        res.redirect('/login');
    }
};

/**
 * Handle logout
 */
exports.logout = async (req, res) => {
    try {
        await supabase.auth.signOut();
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        logger.error('Logout error:', error.message);
        res.redirect('/');
    }
};

/**
 * Request password reset
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.APP_URL || 'http://localhost:3000'}/reset-password`
        });

        if (error) {
            logger.error('Password reset error:', error.message);
            req.flash('error', 'Failed to send reset email');
            return res.redirect('/forgot-password');
        }

        req.flash('success', 'Password reset email sent! Check your inbox.');
        res.redirect('/login');

    } catch (error) {
        logger.error('Password reset error:', error.message);
        req.flash('error', 'Failed to send reset email');
        res.redirect('/forgot-password');
    }
};

/**
 * Reset password
 */
exports.resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const { access_token } = req.query;

        const { error } = await supabase.auth.updateUser({
            password
        });

        if (error) {
            logger.error('Password update error:', error.message);
            req.flash('error', 'Failed to reset password');
            return res.redirect('/reset-password');
        }

        req.flash('success', 'Password updated successfully!');
        res.redirect('/login');

    } catch (error) {
        logger.error('Password reset error:', error.message);
        req.flash('error', 'Failed to reset password');
        res.redirect('/reset-password');
    }
};

/**
 * Show dashboard
 */
exports.showDashboard = async (req, res) => {
    try {
        const userId = req.session.user.id;

        // Get user profile
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        // Get user's proposals
        const { data: proposals } = await supabase
            .from('proposals')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);

        res.render('pages/dashboard', {
            title: 'Dashboard - GrantWise AI',
            user: profile,
            proposals: proposals || []
        });

    } catch (error) {
        logger.error('Dashboard error:', error.message);
        req.flash('error', 'Failed to load dashboard');
        res.redirect('/');
    }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { name } = req.body;

        const { error } = await supabase
            .from('users')
            .update({
                first_name: name.split(' ')[0],
                last_name: name.split(' ').slice(1).join(' ')
            })
            .eq('id', userId);

        if (error) {
            logger.error('Profile update error:', error.message);
            req.flash('error', 'Failed to update profile');
            return res.redirect('/profile');
        }

        req.flash('success', 'Profile updated successfully!');
        res.redirect('/profile');

    } catch (error) {
        logger.error('Profile update error:', error.message);
        req.flash('error', 'Failed to update profile');
        res.redirect('/profile');
    }
};

/**
 * Change password
 */
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Verify current password
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: req.session.user.email,
            password: currentPassword
        });

        if (signInError) {
            req.flash('error', 'Current password is incorrect');
            return res.redirect('/profile');
        }

        // Update password
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            logger.error('Password change error:', error.message);
            req.flash('error', 'Failed to change password');
            return res.redirect('/profile');
        }

        req.flash('success', 'Password changed successfully!');
        res.redirect('/profile');

    } catch (error) {
        logger.error('Password change error:', error.message);
        req.flash('error', 'Failed to change password');
        res.redirect('/profile');
    }
};

/**
 * Delete account
 */
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.session.user.id;

        // Delete user's proposals first
        await supabase
            .from('proposals')
            .delete()
            .eq('user_id', userId);

        // Delete user profile
        await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        // Delete auth user
        await supabase.auth.admin.deleteUser(userId);

        // Destroy session
        req.session.destroy();

        req.flash('success', 'Account deleted successfully');
        res.redirect('/');

    } catch (error) {
        logger.error('Account deletion error:', error.message);
        req.flash('error', 'Failed to delete account');
        res.redirect('/profile');
    }
};

// Aliases for OAuth routes
exports.googleAuth = exports.googleLogin;
exports.googleCallback = exports.authCallback;

