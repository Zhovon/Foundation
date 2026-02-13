const axios = require('axios');
const xml2js = require('xml2js');
const logger = require('../utils/logger');

/**
 * Grants.gov API Integration
 * Free public API for US federal grant opportunities
 */

const GRANTS_GOV_BASE_URL = 'https://www.grants.gov/grantsws/rest';
const GRANTS_GOV_SEARCH_URL = `${GRANTS_GOV_BASE_URL}/opportunities/search/`;
const GRANTS_GOV_DETAIL_URL = `${GRANTS_GOV_BASE_URL}/opportunity/details/`;

/**
 * Search for grants on Grants.gov
 * @param {Object} criteria - Search criteria
 * @returns {Promise<Array>} Array of grant opportunities
 */
async function searchGrants(criteria = {}) {
    try {
        const {
            keyword = '',
            fundingInstrument = '', // Grant, Cooperative Agreement, etc.
            eligibility = '', // 25 (Nonprofits), 00 (State governments), etc.
            category = '', // Education, Health, etc.
            oppStatus = 'forecasted|posted', // forecasted, posted, closed, archived
            sortBy = 'openDate|desc',
            rows = 25,
            startRecordNum = 0
        } = criteria;

        logger.info('Searching Grants.gov', { keyword, category, rows });

        // Build query parameters
        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        if (fundingInstrument) params.append('fundingInstrument', fundingInstrument);
        if (eligibility) params.append('eligibility', eligibility);
        if (category) params.append('category', category);
        if (oppStatus) params.append('oppStatus', oppStatus);
        if (sortBy) params.append('sortBy', sortBy);
        params.append('rows', rows);
        params.append('startRecordNum', startRecordNum);

        const response = await axios.get(`${GRANTS_GOV_SEARCH_URL}?${params.toString()}`, {
            headers: {
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        if (!response.data || !response.data.oppHits) {
            logger.warn('No grants found', criteria);
            return [];
        }

        const grants = response.data.oppHits.map(hit => ({
            id: hit.id,
            number: hit.number,
            title: hit.title,
            agency: hit.agencyName,
            category: hit.categoryName,
            description: hit.synopsis || hit.description || '',
            openDate: hit.openDate,
            closeDate: hit.closeDate,
            estimatedFunding: hit.estimatedFunding || 'Not specified',
            awardCeiling: hit.awardCeiling || null,
            awardFloor: hit.awardFloor || null,
            eligibility: parseEligibility(hit.eligibility),
            url: `https://www.grants.gov/web/grants/view-opportunity.html?oppId=${hit.id}`
        }));

        logger.info(`Found ${grants.length} grants on Grants.gov`);
        return grants;

    } catch (error) {
        logger.error('Error searching Grants.gov:', error.message);
        throw new Error('Failed to search grants. Please try again.');
    }
}

/**
 * Get detailed information about a specific grant
 * @param {string} opportunityId - Grant opportunity ID
 * @returns {Promise<Object>} Detailed grant information
 */
async function getGrantDetails(opportunityId) {
    try {
        logger.info('Fetching grant details', { opportunityId });

        const response = await axios.get(`${GRANTS_GOV_DETAIL_URL}${opportunityId}`, {
            headers: {
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        if (!response.data) {
            throw new Error('Grant not found');
        }

        const grant = response.data;

        return {
            id: grant.id,
            number: grant.number,
            title: grant.title,
            agency: grant.agencyName,
            category: grant.categoryName,
            description: grant.description,
            synopsis: grant.synopsis,
            openDate: grant.openDate,
            closeDate: grant.closeDate,
            postDate: grant.postDate,
            archiveDate: grant.archiveDate,
            estimatedFunding: grant.estimatedFunding,
            awardCeiling: grant.awardCeiling,
            awardFloor: grant.awardFloor,
            expectedAwards: grant.expectedAwards,
            eligibility: parseEligibility(grant.eligibility),
            fundingInstrument: grant.fundingInstrumentType,
            cfda: grant.cfdaList || [],
            costSharing: grant.costSharing,
            additionalInfo: grant.additionalInformation,
            url: `https://www.grants.gov/web/grants/view-opportunity.html?oppId=${grant.id}`,
            applyUrl: `https://www.grants.gov/web/grants/apply-for-grants.html?oppId=${grant.id}`
        };

    } catch (error) {
        logger.error('Error fetching grant details:', error.message);
        throw new Error('Failed to fetch grant details');
    }
}

/**
 * Find grants matching a project
 * Uses AI to score relevance
 * @param {Object} projectData - Project information
 * @returns {Promise<Array>} Matched grants with relevance scores
 */
async function findMatchingGrants(projectData) {
    try {
        // Extract keywords from project
        const keywords = extractKeywords(projectData);

        // Determine category
        const category = determineCategory(projectData);

        logger.info('Finding matching grants', { keywords, category });

        // Search Grants.gov
        const grants = await searchGrants({
            keyword: keywords.join(' '),
            category,
            eligibility: '25', // Nonprofits
            oppStatus: 'forecasted|posted',
            rows: 50
        });

        // Score each grant for relevance
        const scoredGrants = grants.map(grant => ({
            ...grant,
            relevanceScore: calculateRelevanceScore(grant, projectData),
            matchReasons: getMatchReasons(grant, projectData)
        }));

        // Sort by relevance score
        scoredGrants.sort((a, b) => b.relevanceScore - a.relevanceScore);

        // Return top 10
        return scoredGrants.slice(0, 10);

    } catch (error) {
        logger.error('Error finding matching grants:', error.message);
        return [];
    }
}

/**
 * Extract keywords from project data
 * @param {Object} projectData - Project information
 * @returns {Array} Keywords
 */
function extractKeywords(projectData) {
    const text = [
        projectData.projectName || '',
        projectData.mission || '',
        projectData.problem || '',
        projectData.activities || ''
    ].join(' ').toLowerCase();

    // Common grant-related keywords
    const keywords = [];

    // Education keywords
    if (text.match(/education|school|student|learning|teach|literacy|stem/i)) {
        keywords.push('education');
    }

    // Health keywords
    if (text.match(/health|medical|wellness|mental|disease|treatment/i)) {
        keywords.push('health');
    }

    // Environment keywords
    if (text.match(/environment|climate|conservation|sustainability|green|energy/i)) {
        keywords.push('environment');
    }

    // Community keywords
    if (text.match(/community|neighborhood|housing|development|economic/i)) {
        keywords.push('community development');
    }

    // Arts keywords
    if (text.match(/arts|culture|museum|music|theater|creative/i)) {
        keywords.push('arts');
    }

    // Youth keywords
    if (text.match(/youth|children|teen|adolescent|young/i)) {
        keywords.push('youth');
    }

    return keywords.length > 0 ? keywords : ['nonprofit', 'community'];
}

/**
 * Determine grant category from project
 * @param {Object} projectData - Project information
 * @returns {string} Category code
 */
function determineCategory(projectData) {
    const text = [
        projectData.projectName || '',
        projectData.mission || '',
        projectData.problem || ''
    ].join(' ').toLowerCase();

    // Grants.gov category codes
    if (text.match(/education|school|student/i)) return 'ED';
    if (text.match(/health|medical|wellness/i)) return 'HL';
    if (text.match(/environment|climate|conservation/i)) return 'EN';
    if (text.match(/housing|community development/i)) return 'CD';
    if (text.match(/arts|culture|humanities/i)) return 'AH';
    if (text.match(/science|research|technology/i)) return 'ST';

    return ''; // All categories
}

/**
 * Calculate relevance score for a grant
 * @param {Object} grant - Grant opportunity
 * @param {Object} projectData - Project information
 * @returns {number} Score from 0-100
 */
function calculateRelevanceScore(grant, projectData) {
    let score = 0;

    const projectText = [
        projectData.projectName || '',
        projectData.mission || '',
        projectData.problem || '',
        projectData.activities || ''
    ].join(' ').toLowerCase();

    const grantText = [
        grant.title || '',
        grant.description || '',
        grant.category || ''
    ].join(' ').toLowerCase();

    // Keyword matching (40 points)
    const projectWords = projectText.split(/\s+/).filter(w => w.length > 4);
    const grantWords = new Set(grantText.split(/\s+/));
    const matchingWords = projectWords.filter(w => grantWords.has(w));
    score += Math.min(40, matchingWords.length * 5);

    // Category match (20 points)
    if (projectText.includes(grant.category.toLowerCase())) {
        score += 20;
    }

    // Funding amount appropriate (20 points)
    if (projectData.budget && grant.awardCeiling) {
        const budgetAmount = parseInt(projectData.budget.match(/\d+/)?.[0] || '0');
        if (budgetAmount > 0 && budgetAmount <= grant.awardCeiling) {
            score += 20;
        }
    }

    // Grant is open (20 points)
    if (grant.closeDate) {
        const closeDate = new Date(grant.closeDate);
        const now = new Date();
        if (closeDate > now) {
            score += 20;
        }
    }

    return Math.min(100, score);
}

/**
 * Get reasons why grant matches project
 * @param {Object} grant - Grant opportunity
 * @param {Object} projectData - Project information
 * @returns {Array} Match reasons
 */
function getMatchReasons(grant, projectData) {
    const reasons = [];

    const projectText = [
        projectData.projectName || '',
        projectData.mission || ''
    ].join(' ').toLowerCase();

    // Category match
    if (projectText.includes(grant.category.toLowerCase())) {
        reasons.push(`Matches ${grant.category} category`);
    }

    // Funding range
    if (grant.awardCeiling) {
        reasons.push(`Awards up to $${grant.awardCeiling.toLocaleString()}`);
    }

    // Deadline
    if (grant.closeDate) {
        const closeDate = new Date(grant.closeDate);
        const daysUntilClose = Math.ceil((closeDate - new Date()) / (1000 * 60 * 60 * 24));
        if (daysUntilClose > 0) {
            reasons.push(`Deadline in ${daysUntilClose} days`);
        }
    }

    // Eligibility
    if (grant.eligibility && grant.eligibility.includes('Nonprofits')) {
        reasons.push('Nonprofits eligible');
    }

    return reasons;
}

/**
 * Parse eligibility codes
 * @param {string} eligibilityCode - Grants.gov eligibility code
 * @returns {string} Human-readable eligibility
 */
function parseEligibility(eligibilityCode) {
    if (!eligibilityCode) return 'Not specified';

    const codes = {
        '00': 'State governments',
        '01': 'County governments',
        '02': 'City or township governments',
        '04': 'Special district governments',
        '05': 'Independent school districts',
        '06': 'Public and State controlled institutions of higher education',
        '07': 'Native American tribal governments (Federally recognized)',
        '08': 'Public housing authorities/Indian housing authorities',
        '11': 'Native American tribal organizations (other than Federally recognized)',
        '12': 'Nonprofits having a 501(c)(3) status with the IRS, other than institutions of higher education',
        '13': 'Nonprofits that do not have a 501(c)(3) status with the IRS, other than institutions of higher education',
        '20': 'Private institutions of higher education',
        '21': 'Individuals',
        '22': 'For profit organizations other than small businesses',
        '23': 'Small businesses',
        '25': 'Others'
    };

    const eligibilityList = eligibilityCode.split('|').map(code => codes[code] || code);
    return eligibilityList.join(', ');
}

module.exports = {
    searchGrants,
    getGrantDetails,
    findMatchingGrants,
    extractKeywords,
    calculateRelevanceScore
};
