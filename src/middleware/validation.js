const { body, validationResult } = require('express-validator');
const { VALIDATION } = require('../config/constants');

// Validation middleware to check for errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If it's an AJAX request, return JSON
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        // Otherwise, flash errors and redirect back
        req.flash('error', errors.array().map(e => e.msg).join(', '));
        return res.redirect('back');
    }
    next();
};

// Proposal generation validation rules
const proposalValidation = [
    body('organizationName')
        .trim()
        .notEmpty().withMessage('Organization name is required')
        .isLength({ min: 2, max: 200 }).withMessage('Organization name must be between 2 and 200 characters'),

    body('projectName')
        .trim()
        .notEmpty().withMessage('Project name is required')
        .isLength({ min: VALIDATION.minProjectNameLength, max: VALIDATION.maxProjectNameLength })
        .withMessage(`Project name must be between ${VALIDATION.minProjectNameLength} and ${VALIDATION.maxProjectNameLength} characters`),

    body('mission')
        .trim()
        .notEmpty().withMessage('Mission statement is required')
        .isLength({ min: VALIDATION.minMissionLength, max: VALIDATION.maxMissionLength })
        .withMessage(`Mission statement must be between ${VALIDATION.minMissionLength} and ${VALIDATION.maxMissionLength} characters`),

    body('problem')
        .trim()
        .notEmpty().withMessage('Problem description is required')
        .isLength({ min: 50, max: 2000 }).withMessage('Problem description must be between 50 and 2000 characters'),

    body('activities')
        .trim()
        .notEmpty().withMessage('Proposed activities are required')
        .isLength({ min: 50, max: 2000 }).withMessage('Activities description must be between 50 and 2000 characters'),

    body('targetPopulation')
        .trim()
        .notEmpty().withMessage('Target population is required')
        .isLength({ min: 10, max: 500 }).withMessage('Target population must be between 10 and 500 characters'),

    body('duration')
        .trim()
        .notEmpty().withMessage('Project duration is required')
        .isLength({ min: 3, max: 100 }).withMessage('Duration must be between 3 and 100 characters'),

    body('outcomes')
        .trim()
        .notEmpty().withMessage('Expected outcomes are required')
        .isLength({ min: 50, max: 1000 }).withMessage('Outcomes must be between 50 and 1000 characters'),

    body('budget')
        .trim()
        .notEmpty().withMessage('Budget is required')
        .isLength({ min: 10, max: 1000 }).withMessage('Budget must be between 10 and 1000 characters'),

    body('metrics')
        .trim()
        .notEmpty().withMessage('Success metrics are required')
        .isLength({ min: 20, max: 1000 }).withMessage('Metrics must be between 20 and 1000 characters'),

    body('guidelines')
        .trim()
        .notEmpty().withMessage('Grant guidelines are required')
        .isLength({ min: VALIDATION.minGuidelinesLength, max: VALIDATION.maxGuidelinesLength })
        .withMessage(`Guidelines must be between ${VALIDATION.minGuidelinesLength} and ${VALIDATION.maxGuidelinesLength} characters`),

    body('organizationVoice')
        .optional()
        .trim()
        .isLength({ max: 10000 }).withMessage('Organization voice samples must be less than 10000 characters')
];

// Email validation
const emailValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail()
];

// Password validation
const passwordValidation = [
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

module.exports = {
    validate,
    proposalValidation,
    emailValidation,
    passwordValidation
};
