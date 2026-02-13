const { Resend } = require('resend');
const logger = require('../utils/logger');

/**
 * Email service using Resend
 */

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const appUrl = process.env.APP_URL || 'http://localhost:3000';

if (!resendApiKey) {
    logger.warn('Resend API key not configured. Email features will be disabled.');
}

// Initialize Resend client
const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Send email verification
 * @param {string} email - User email
 * @param {string} token - Verification token
 */
async function sendVerificationEmail(email, token) {
    if (!resend) {
        logger.warn('Resend not configured, skipping verification email');
        return;
    }

    try {
        const verificationUrl = `${appUrl}/verify-email?token=${token}`;

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: 'Verify your GrantWise AI account',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to GrantWise AI! 🎉</h1>
                        </div>
                        <div class="content">
                            <p>Hi there,</p>
                            <p>Thanks for signing up! Please verify your email address to get started with GrantWise AI.</p>
                            <p style="text-align: center;">
                                <a href="${verificationUrl}" class="button">Verify Email Address</a>
                            </p>
                            <p>Or copy and paste this link into your browser:</p>
                            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
                            <p><strong>This link expires in 24 hours.</strong></p>
                            <p>If you didn't create an account, you can safely ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} GrantWise AI. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        if (error) {
            logger.error('Failed to send verification email:', error);
            throw error;
        }

        logger.info('Verification email sent successfully', { email, id: data.id });
        return data;
    } catch (error) {
        logger.error('Error sending verification email:', error.message);
        throw new Error('Failed to send verification email');
    }
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} token - Reset token
 */
async function sendPasswordResetEmail(email, token) {
    if (!resend) {
        logger.warn('Resend not configured, skipping password reset email');
        return;
    }

    try {
        const resetUrl = `${appUrl}/reset-password?token=${token}`;

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: 'Reset your GrantWise AI password',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Password Reset Request</h1>
                        </div>
                        <div class="content">
                            <p>Hi there,</p>
                            <p>We received a request to reset your password for your GrantWise AI account.</p>
                            <p style="text-align: center;">
                                <a href="${resetUrl}" class="button">Reset Password</a>
                            </p>
                            <p>Or copy and paste this link into your browser:</p>
                            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
                            <div class="warning">
                                <strong>⚠️ Security Notice:</strong>
                                <ul>
                                    <li>This link expires in 1 hour</li>
                                    <li>If you didn't request this, please ignore this email</li>
                                    <li>Your password won't change until you create a new one</li>
                                </ul>
                            </div>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} GrantWise AI. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        if (error) {
            logger.error('Failed to send password reset email:', error);
            throw error;
        }

        logger.info('Password reset email sent successfully', { email, id: data.id });
        return data;
    } catch (error) {
        logger.error('Error sending password reset email:', error.message);
        throw new Error('Failed to send password reset email');
    }
}

/**
 * Send welcome email
 * @param {string} email - User email
 * @param {string} name - User name
 */
async function sendWelcomeEmail(email, name) {
    if (!resend) {
        logger.warn('Resend not configured, skipping welcome email');
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: 'Welcome to GrantWise AI! 🚀',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                        .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #667eea; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to GrantWise AI! 🎉</h1>
                        </div>
                        <div class="content">
                            <p>Hi ${name || 'there'},</p>
                            <p>Your account is now active! We're excited to help you create winning grant proposals with the power of AI.</p>
                            
                            <h3>What you can do now:</h3>
                            
                            <div class="feature">
                                <strong>🤖 Generate Proposals</strong>
                                <p>Create professional grant proposals in minutes using GPT-4</p>
                            </div>
                            
                            <div class="feature">
                                <strong>📄 Export to Word/PDF</strong>
                                <p>Download your proposals in multiple formats</p>
                            </div>
                            
                            <div class="feature">
                                <strong>🎯 Find Matching Grants</strong>
                                <p>Discover federal grants that match your project</p>
                            </div>
                            
                            <div class="feature">
                                <strong>✅ Compliance Checking</strong>
                                <p>Ensure your proposals meet all requirements</p>
                            </div>
                            
                            <p style="text-align: center;">
                                <a href="${appUrl}/generate" class="button">Create Your First Proposal</a>
                            </p>
                            
                            <p><strong>Free Tier:</strong> You get 1 free proposal per month. Need more? Check out our <a href="${appUrl}/pricing">pricing plans</a>.</p>
                            
                            <p>Need help? Reply to this email or visit our <a href="${appUrl}/help">help center</a>.</p>
                            
                            <p>Happy grant writing! 🚀</p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} GrantWise AI. All rights reserved.</p>
                            <p><a href="${appUrl}/privacy-policy">Privacy Policy</a> | <a href="${appUrl}/terms">Terms of Service</a></p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        if (error) {
            logger.error('Failed to send welcome email:', error);
            throw error;
        }

        logger.info('Welcome email sent successfully', { email, id: data.id });
        return data;
    } catch (error) {
        logger.error('Error sending welcome email:', error.message);
        throw new Error('Failed to send welcome email');
    }
}

/**
 * Send subscription confirmation email
 * @param {string} email - User email
 * @param {string} tier - Subscription tier
 */
async function sendSubscriptionConfirmation(email, tier) {
    if (!resend) {
        logger.warn('Resend not configured, skipping subscription confirmation email');
        return;
    }

    try {
        const tierDetails = {
            starter: { name: 'Starter', price: '$49', proposals: '5' },
            professional: { name: 'Professional', price: '$99', proposals: 'Unlimited' },
            team: { name: 'Team', price: '$199', proposals: 'Unlimited' }
        };

        const details = tierDetails[tier] || tierDetails.starter;

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: `Welcome to ${details.name} Plan! 🎉`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                        .plan-details { background: white; padding: 20px; margin: 20px 0; border-radius: 6px; border: 2px solid #667eea; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Subscription Confirmed! 🎉</h1>
                        </div>
                        <div class="content">
                            <p>Hi there,</p>
                            <p>Thank you for subscribing to GrantWise AI ${details.name} plan!</p>
                            
                            <div class="plan-details">
                                <h3>${details.name} Plan</h3>
                                <p><strong>Price:</strong> ${details.price}/month</p>
                                <p><strong>Proposals:</strong> ${details.proposals} per month</p>
                                <p><strong>Status:</strong> Active ✅</p>
                            </div>
                            
                            <p>Your subscription is now active and you have full access to all features.</p>
                            
                            <p style="text-align: center;">
                                <a href="${appUrl}/dashboard" class="button">Go to Dashboard</a>
                            </p>
                            
                            <p><strong>Manage Subscription:</strong> You can update your payment method or cancel anytime from your <a href="${appUrl}/dashboard">dashboard</a>.</p>
                            
                            <p>Questions? Reply to this email - we're here to help!</p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} GrantWise AI. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        if (error) {
            logger.error('Failed to send subscription confirmation email:', error);
            throw error;
        }

        logger.info('Subscription confirmation email sent successfully', { email, tier, id: data.id });
        return data;
    } catch (error) {
        logger.error('Error sending subscription confirmation email:', error.message);
        throw new Error('Failed to send subscription confirmation email');
    }
}

/**
 * Send usage limit warning email
 * @param {string} email - User email
 * @param {number} used - Proposals used
 * @param {number} limit - Proposal limit
 */
async function sendUsageLimitWarning(email, used, limit) {
    if (!resend) {
        logger.warn('Resend not configured, skipping usage warning email');
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: 'You\'re approaching your proposal limit',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                        .usage-bar { background: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden; margin: 20px 0; }
                        .usage-fill { background: #f59e0b; height: 100%; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>⚠️ Usage Limit Warning</h1>
                        </div>
                        <div class="content">
                            <p>Hi there,</p>
                            <p>You've used <strong>${used} of ${limit}</strong> proposals this month.</p>
                            
                            <div class="usage-bar">
                                <div class="usage-fill" style="width: ${(used / limit) * 100}%"></div>
                            </div>
                            
                            <p>Want to create more proposals? Upgrade your plan for unlimited access!</p>
                            
                            <p style="text-align: center;">
                                <a href="${appUrl}/pricing" class="button">View Pricing Plans</a>
                            </p>
                            
                            <p><strong>Professional Plan:</strong> $99/month - Unlimited proposals + priority support</p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} GrantWise AI. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        if (error) {
            logger.error('Failed to send usage warning email:', error);
            throw error;
        }

        logger.info('Usage warning email sent successfully', { email, used, limit, id: data.id });
        return data;
    } catch (error) {
        logger.error('Error sending usage warning email:', error.message);
        throw new Error('Failed to send usage warning email');
    }
}

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendSubscriptionConfirmation,
    sendUsageLimitWarning
};
