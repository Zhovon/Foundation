const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    projectData: {
        organizationName: String,
        projectName: String,
        mission: String,
        problem: String,
        activities: String,
        targetPopulation: String,
        duration: String,
        outcomes: String,
        budget: String,
        metrics: String,
        guidelines: String,
        organizationVoice: String
    },
    proposal: {
        type: String,
        required: true
    },
    parsedGuidelines: {
        wordLimit: Number,
        characterLimit: Number,
        requiredSections: [String],
        eligibilityCriteria: [String],
        priorities: [String],
        deadlines: [String],
        formatting: [String]
    },
    complianceReport: {
        compliant: Boolean,
        issues: [String],
        warnings: [String],
        stats: {
            wordCount: Number,
            characterCount: Number,
            sectionsFound: Number,
            sectionsRequired: Number
        }
    },
    metadata: {
        tokensUsed: Number,
        model: String,
        generatedAt: Date
    },
    status: {
        type: String,
        enum: ['draft', 'final', 'submitted', 'won', 'lost'],
        default: 'draft'
    },
    outcome: {
        status: {
            type: String,
            enum: ['pending', 'won', 'lost']
        },
        amountRequested: Number,
        amountAwarded: Number,
        notes: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
proposalSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Proposal', proposalSchema);
