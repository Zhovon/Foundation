const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

/**
 * Supabase client configuration
 */

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    logger.warn('Supabase credentials not configured. Authentication features will be disabled.');
}

// Create Supabase client only if credentials are provided
let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    });
    logger.info('Supabase client initialized successfully');
}

/**
 * Get Supabase client instance
 * @returns {Object} Supabase client
 */
function getSupabaseClient() {
    return supabase;
}

/**
 * Create Supabase client with custom auth token
 * @param {string} accessToken - User's access token
 * @returns {Object} Supabase client with auth
 */
function getSupabaseClientWithAuth(accessToken) {
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    });
}

module.exports = {
    supabase,
    getSupabaseClient,
    getSupabaseClientWithAuth
};
