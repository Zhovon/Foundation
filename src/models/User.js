const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId; // Password required only if not using Google OAuth
        }
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    organizationName: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    subscriptionTier: {
        type: String,
        enum: ['free', 'starter', 'professional', 'team'],
        default: 'free'
    },
    stripeCustomerId: {
        type: String
    },
    stripeSubscriptionId: {
        type: String
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'canceled', 'past_due', 'trialing', 'inactive'],
        default: 'inactive'
    },
    usageStats: {
        proposalsThisMonth: {
            type: Number,
            default: 0
        },
        proposalsTotal: {
            type: Number,
            default: 0
        },
        lastResetDate: {
            type: Date,
            default: Date.now
        }
    },
    proposals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proposal'
    }],
    emailVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user can generate proposal based on tier limits
userSchema.methods.canGenerateProposal = function () {
    const limits = {
        free: 1,
        starter: 5,
        professional: Infinity,
        team: Infinity
    };

    const limit = limits[this.subscriptionTier];
    return this.usageStats.proposalsThisMonth < limit;
};

// Increment usage stats
userSchema.methods.incrementUsage = async function () {
    this.usageStats.proposalsThisMonth += 1;
    this.usageStats.proposalsTotal += 1;
    await this.save();
};

// Reset monthly usage (should be called by a cron job)
userSchema.methods.resetMonthlyUsage = async function () {
    this.usageStats.proposalsThisMonth = 0;
    this.usageStats.lastResetDate = new Date();
    await this.save();
};

// Get user's full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
