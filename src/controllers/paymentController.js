const { getPaddleClient, getProductIdForTier } = require('../config/paddle');
const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

/**
 * Payment Controller using Paddle
 */

/**
 * Create checkout session
 */
exports.createCheckout = async (req, res) => {
    try {
        const { tier } = req.body;
        const userId = req.session.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Please log in to subscribe'
            });
        }

        // Get user data
        const { data: user } = await supabase
            .from('users')
            .select('email, first_name, last_name')
            .eq('id', userId)
            .single();

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const productId = getProductIdForTier(tier);
        if (!productId) {
            return res.status(400).json({
                success: false,
                error: 'Invalid subscription tier'
            });
        }

        const paddle = getPaddleClient();

        // Create transaction
        const transaction = await paddle.transactions.create({
            items: [{
                priceId: productId,
                quantity: 1
            }],
            customerId: user.paddle_customer_id || undefined,
            customerEmail: user.email,
            customData: {
                userId: userId,
                tier: tier
            },
            successUrl: `${process.env.APP_URL}/payment/success?tier=${tier}`,
            cancelUrl: `${process.env.APP_URL}/pricing`
        });

        logger.info('Paddle checkout created', {
            userId,
            tier,
            transactionId: transaction.id
        });

        res.json({
            success: true,
            checkoutUrl: transaction.checkoutUrl
        });

    } catch (error) {
        logger.error('Error creating Paddle checkout:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to create checkout session'
        });
    }
};

/**
 * Handle Paddle webhook
 */
exports.handleWebhook = async (req, res) => {
    try {
        const paddle = getPaddleClient();
        const signature = req.headers['paddle-signature'];

        // Verify webhook signature
        const isValid = paddle.webhooks.verify(
            req.body,
            signature,
            process.env.PADDLE_WEBHOOK_SECRET
        );

        if (!isValid) {
            logger.error('Invalid Paddle webhook signature');
            return res.status(401).send('Invalid signature');
        }

        const event = req.body;
        logger.info('Paddle webhook received', { eventType: event.event_type });

        switch (event.event_type) {
            case 'transaction.completed':
                await handleTransactionCompleted(event.data);
                break;

            case 'subscription.created':
                await handleSubscriptionCreated(event.data);
                break;

            case 'subscription.updated':
                await handleSubscriptionUpdated(event.data);
                break;

            case 'subscription.canceled':
                await handleSubscriptionCanceled(event.data);
                break;

            case 'subscription.paused':
                await handleSubscriptionPaused(event.data);
                break;

            case 'subscription.resumed':
                await handleSubscriptionResumed(event.data);
                break;

            default:
                logger.info('Unhandled Paddle event type:', event.event_type);
        }

        res.status(200).send('Webhook received');

    } catch (error) {
        logger.error('Error processing Paddle webhook:', error.message);
        res.status(500).send('Webhook processing failed');
    }
};

/**
 * Handle transaction completed
 */
async function handleTransactionCompleted(data) {
    try {
        const userId = data.custom_data?.userId;
        const tier = data.custom_data?.tier;

        if (!userId || !tier) {
            logger.error('Missing user data in transaction', data);
            return;
        }

        // Update user subscription
        const { error } = await supabase
            .from('users')
            .update({
                subscription_tier: tier,
                paddle_customer_id: data.customer_id,
                paddle_subscription_id: data.subscription_id,
                subscription_status: 'active',
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) {
            logger.error('Error updating user subscription:', error.message);
        } else {
            logger.info('Subscription activated', { userId, tier });
        }

    } catch (error) {
        logger.error('Error handling transaction completed:', error.message);
    }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(data) {
    try {
        const userId = data.custom_data?.userId;

        if (!userId) return;

        await supabase
            .from('users')
            .update({
                paddle_subscription_id: data.id,
                subscription_status: 'active',
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        logger.info('Subscription created', { userId, subscriptionId: data.id });

    } catch (error) {
        logger.error('Error handling subscription created:', error.message);
    }
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(data) {
    try {
        const { error } = await supabase
            .from('users')
            .update({
                subscription_status: data.status,
                updated_at: new Date().toISOString()
            })
            .eq('paddle_subscription_id', data.id);

        if (!error) {
            logger.info('Subscription updated', { subscriptionId: data.id, status: data.status });
        }

    } catch (error) {
        logger.error('Error handling subscription updated:', error.message);
    }
}

/**
 * Handle subscription canceled
 */
async function handleSubscriptionCanceled(data) {
    try {
        await supabase
            .from('users')
            .update({
                subscription_tier: 'free',
                subscription_status: 'canceled',
                updated_at: new Date().toISOString()
            })
            .eq('paddle_subscription_id', data.id);

        logger.info('Subscription canceled', { subscriptionId: data.id });

    } catch (error) {
        logger.error('Error handling subscription canceled:', error.message);
    }
}

/**
 * Handle subscription paused
 */
async function handleSubscriptionPaused(data) {
    try {
        await supabase
            .from('users')
            .update({
                subscription_status: 'paused',
                updated_at: new Date().toISOString()
            })
            .eq('paddle_subscription_id', data.id);

        logger.info('Subscription paused', { subscriptionId: data.id });

    } catch (error) {
        logger.error('Error handling subscription paused:', error.message);
    }
}

/**
 * Handle subscription resumed
 */
async function handleSubscriptionResumed(data) {
    try {
        await supabase
            .from('users')
            .update({
                subscription_status: 'active',
                updated_at: new Date().toISOString()
            })
            .eq('paddle_subscription_id', data.id);

        logger.info('Subscription resumed', { subscriptionId: data.id });

    } catch (error) {
        logger.error('Error handling subscription resumed:', error.message);
    }
}

/**
 * Cancel subscription
 */
exports.cancelSubscription = async (req, res) => {
    try {
        const userId = req.session.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Please log in'
            });
        }

        // Get user's subscription ID
        const { data: user } = await supabase
            .from('users')
            .select('paddle_subscription_id')
            .eq('id', userId)
            .single();

        if (!user?.paddle_subscription_id) {
            return res.status(404).json({
                success: false,
                error: 'No active subscription found'
            });
        }

        const paddle = getPaddleClient();

        // Cancel subscription
        await paddle.subscriptions.cancel(user.paddle_subscription_id, {
            effectiveFrom: 'next_billing_period'
        });

        logger.info('Subscription cancellation requested', { userId });

        res.json({
            success: true,
            message: 'Subscription will be canceled at the end of the billing period'
        });

    } catch (error) {
        logger.error('Error canceling subscription:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel subscription'
        });
    }
};

/**
 * Get customer portal URL
 */
exports.getCustomerPortal = async (req, res) => {
    try {
        const userId = req.session.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Please log in'
            });
        }

        // Get user's customer ID
        const { data: user } = await supabase
            .from('users')
            .select('paddle_customer_id')
            .eq('id', userId)
            .single();

        if (!user?.paddle_customer_id) {
            return res.status(404).json({
                success: false,
                error: 'No customer account found'
            });
        }

        // Paddle customer portal URL
        const portalUrl = `https://checkout.paddle.com/customer/${user.paddle_customer_id}`;

        res.json({
            success: true,
            portalUrl
        });

    } catch (error) {
        logger.error('Error getting customer portal:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to get customer portal'
        });
    }
};

/**
 * Show payment success page
 */
exports.showPaymentSuccess = async (req, res) => {
    const { tier } = req.query;

    res.render('pages/payment-success', {
        title: 'Payment Successful - GrantWise AI',
        tier: tier || 'starter'
    });
};
