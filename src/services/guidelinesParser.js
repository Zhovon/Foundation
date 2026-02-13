const logger = require('../utils/logger');

/**
 * Parse grant guidelines to extract requirements
 * @param {string} guidelinesText - Raw guidelines text
 * @returns {Object} Parsed guidelines with requirements
 */
function parseGuidelines(guidelinesText) {
    const parsed = {
        wordLimit: null,
        characterLimit: null,
        requiredSections: [],
        eligibilityCriteria: [],
        priorities: [],
        deadlines: [],
        formatting: [],
        raw: guidelinesText
    };

    try {
        // Extract word limits
        const wordLimitPatterns = [
            /(\d+)\s*word\s*limit/i,
            /maximum\s*of\s*(\d+)\s*words/i,
            /not\s*exceed\s*(\d+)\s*words/i,
            /(\d+)\s*words?\s*maximum/i,
            /limit\s*of\s*(\d+)\s*words/i
        ];

        for (const pattern of wordLimitPatterns) {
            const match = guidelinesText.match(pattern);
            if (match) {
                parsed.wordLimit = parseInt(match[1]);
                break;
            }
        }

        // Extract character limits
        const charLimitPatterns = [
            /(\d+)\s*character\s*limit/i,
            /maximum\s*of\s*(\d+)\s*characters/i,
            /not\s*exceed\s*(\d+)\s*characters/i
        ];

        for (const pattern of charLimitPatterns) {
            const match = guidelinesText.match(pattern);
            if (match) {
                parsed.characterLimit = parseInt(match[1]);
                break;
            }
        }

        // Extract required sections
        const sectionPatterns = [
            /required\s*sections?:?\s*([^\n]+)/i,
            /must\s*include:?\s*([^\n]+)/i,
            /proposal\s*should\s*contain:?\s*([^\n]+)/i
        ];

        for (const pattern of sectionPatterns) {
            const match = guidelinesText.match(pattern);
            if (match) {
                const sections = match[1].split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0);
                parsed.requiredSections.push(...sections);
            }
        }

        // Common section keywords
        const commonSections = [
            'executive summary',
            'problem statement',
            'project description',
            'goals and objectives',
            'methodology',
            'timeline',
            'budget',
            'evaluation',
            'sustainability',
            'organizational capacity',
            'impact'
        ];

        commonSections.forEach(section => {
            const regex = new RegExp(section, 'i');
            if (regex.test(guidelinesText) && !parsed.requiredSections.includes(section)) {
                parsed.requiredSections.push(section);
            }
        });

        // Extract eligibility criteria
        const eligibilityPatterns = [
            /eligib(?:le|ility):?\s*([^\n]+)/gi,
            /must\s*be:?\s*([^\n]+)/gi,
            /applicants?\s*must:?\s*([^\n]+)/gi
        ];

        eligibilityPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(guidelinesText)) !== null) {
                parsed.eligibilityCriteria.push(match[1].trim());
            }
        });

        // Extract funding priorities
        const priorityPatterns = [
            /priorit(?:y|ies):?\s*([^\n]+)/gi,
            /focus\s*areas?:?\s*([^\n]+)/gi,
            /we\s*fund:?\s*([^\n]+)/gi
        ];

        priorityPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(guidelinesText)) !== null) {
                parsed.priorities.push(match[1].trim());
            }
        });

        // Extract deadlines
        const deadlinePatterns = [
            /deadline:?\s*([^\n]+)/gi,
            /due\s*date:?\s*([^\n]+)/gi,
            /submit\s*by:?\s*([^\n]+)/gi
        ];

        deadlinePatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(guidelinesText)) !== null) {
                parsed.deadlines.push(match[1].trim());
            }
        });

        // Extract formatting requirements
        const formattingPatterns = [
            /format:?\s*([^\n]+)/gi,
            /font:?\s*([^\n]+)/gi,
            /spacing:?\s*([^\n]+)/gi,
            /margins?:?\s*([^\n]+)/gi
        ];

        formattingPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(guidelinesText)) !== null) {
                parsed.formatting.push(match[1].trim());
            }
        });

        logger.info('Guidelines parsed successfully', {
            wordLimit: parsed.wordLimit,
            sectionsFound: parsed.requiredSections.length
        });

    } catch (error) {
        logger.error('Error parsing guidelines:', error.message);
    }

    return parsed;
}

/**
 * Check if a proposal complies with guidelines
 * @param {string} proposal - Generated proposal text
 * @param {Object} guidelines - Parsed guidelines
 * @returns {Object} Compliance report
 */
function checkCompliance(proposal, guidelines) {
    const report = {
        compliant: true,
        issues: [],
        warnings: [],
        stats: {}
    };

    // Check word count
    const wordCount = proposal.split(/\s+/).filter(w => w.length > 0).length;
    report.stats.wordCount = wordCount;

    if (guidelines.wordLimit) {
        if (wordCount > guidelines.wordLimit) {
            report.compliant = false;
            report.issues.push(`Exceeds word limit: ${wordCount} words (limit: ${guidelines.wordLimit})`);
        } else if (wordCount > guidelines.wordLimit * 0.95) {
            report.warnings.push(`Close to word limit: ${wordCount}/${guidelines.wordLimit} words`);
        }
    }

    // Check character count
    const charCount = proposal.length;
    report.stats.characterCount = charCount;

    if (guidelines.characterLimit && charCount > guidelines.characterLimit) {
        report.compliant = false;
        report.issues.push(`Exceeds character limit: ${charCount} characters (limit: ${guidelines.characterLimit})`);
    }

    // Check for required sections
    const missingSections = [];
    guidelines.requiredSections.forEach(section => {
        const regex = new RegExp(section, 'i');
        if (!regex.test(proposal)) {
            missingSections.push(section);
        }
    });

    if (missingSections.length > 0) {
        report.compliant = false;
        report.issues.push(`Missing required sections: ${missingSections.join(', ')}`);
    }

    report.stats.sectionsFound = guidelines.requiredSections.length - missingSections.length;
    report.stats.sectionsRequired = guidelines.requiredSections.length;

    return report;
}

module.exports = {
    parseGuidelines,
    checkCompliance
};
