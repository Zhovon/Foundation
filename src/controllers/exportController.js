const { generateWordDocument, generatePDF, generateTextFile } = require('../services/exportService');
const logger = require('../utils/logger');

/**
 * Export proposal as Word document
 */
exports.exportWord = async (req, res) => {
    try {
        const lastProposal = req.session.lastProposal;

        if (!lastProposal) {
            return res.status(404).json({
                success: false,
                error: 'No proposal found. Please generate a proposal first.'
            });
        }

        const metadata = {
            projectName: lastProposal.projectData.projectName,
            organizationName: lastProposal.projectData.organizationName
        };

        logger.info('Exporting proposal as Word', metadata);

        const buffer = await generateWordDocument(lastProposal.proposal, metadata);

        const filename = `${metadata.projectName.replace(/\s+/g, '_')}_proposal.docx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);

        res.send(buffer);

    } catch (error) {
        logger.error('Error exporting Word document:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to export Word document'
        });
    }
};

/**
 * Export proposal as PDF
 */
exports.exportPDF = async (req, res) => {
    try {
        const lastProposal = req.session.lastProposal;

        if (!lastProposal) {
            return res.status(404).json({
                success: false,
                error: 'No proposal found. Please generate a proposal first.'
            });
        }

        const metadata = {
            projectName: lastProposal.projectData.projectName,
            organizationName: lastProposal.projectData.organizationName
        };

        logger.info('Exporting proposal as PDF', metadata);

        const buffer = await generatePDF(lastProposal.proposal, metadata);

        const filename = `${metadata.projectName.replace(/\s+/g, '_')}_proposal.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);

        res.send(buffer);

    } catch (error) {
        logger.error('Error exporting PDF:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to export PDF'
        });
    }
};

/**
 * Export proposal as plain text
 */
exports.exportText = async (req, res) => {
    try {
        const lastProposal = req.session.lastProposal;

        if (!lastProposal) {
            return res.status(404).json({
                success: false,
                error: 'No proposal found. Please generate a proposal first.'
            });
        }

        const metadata = {
            projectName: lastProposal.projectData.projectName,
            organizationName: lastProposal.projectData.organizationName
        };

        const { content, filename } = generateTextFile(lastProposal.proposal, metadata);

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        res.send(content);

    } catch (error) {
        logger.error('Error exporting text file:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to export text file'
        });
    }
};
