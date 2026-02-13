// Application constants and configuration

module.exports = {
    // Pricing tiers
    PRICING_TIERS: {
        STARTER: {
            name: 'Starter',
            price: 49,
            currency: 'USD',
            interval: 'month',
            features: {
                proposalsPerMonth: 5,
                organizationVoice: false,
                complianceChecker: false,
                prioritySupport: false,
                teamCollaboration: false,
                batchGeneration: false
            }
        },
        PROFESSIONAL: {
            name: 'Professional',
            price: 99,
            currency: 'USD',
            interval: 'month',
            features: {
                proposalsPerMonth: -1, // unlimited
                organizationVoice: true,
                complianceChecker: true,
                prioritySupport: true,
                teamCollaboration: false,
                batchGeneration: true
            }
        },
        TEAM: {
            name: 'Team',
            price: 199,
            currency: 'USD',
            interval: 'month',
            features: {
                proposalsPerMonth: -1, // unlimited
                organizationVoice: true,
                complianceChecker: true,
                prioritySupport: true,
                teamCollaboration: true,
                teamMembers: 5,
                batchGeneration: true
            }
        }
    },

    // OpenAI configuration
    OPENAI: {
        model: 'gpt-4-turbo-preview',
        maxTokens: 4000,
        temperature: 0.7
    },

    // Validation rules
    VALIDATION: {
        minProjectNameLength: 3,
        maxProjectNameLength: 200,
        minMissionLength: 50,
        maxMissionLength: 2000,
        minGuidelinesLength: 100,
        maxGuidelinesLength: 10000,
        maxFileSize: 10 * 1024 * 1024 // 10MB
    },

    // Rate limiting
    RATE_LIMITS: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
        maxProposalRequests: 10 // per window
    },

    // Session configuration
    SESSION: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        cookieName: 'grantwise.sid'
    },

    // Feature flags
    FEATURES: {
        organizationVoice: true,
        guidelinesParser: true,
        batchGeneration: false, // Phase 5
        funderIntelligence: false, // Phase 5
        googleDocsExport: false // Phase 3
    }
};
