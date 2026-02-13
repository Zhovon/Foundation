const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip } = require('docx');
const PDFDocument = require('pdfkit');
const logger = require('../utils/logger');

/**
 * Export service for generating downloadable proposal files
 */

/**
 * Generate a plain text file
 * @param {string} proposal - Proposal content
 * @param {Object} metadata - Project metadata
 * @returns {Object} File data
 */
function generateTextFile(proposal, metadata) {
    const header = `
${metadata.organizationName}
${metadata.projectName}
Generated: ${new Date().toLocaleDateString()}

${'='.repeat(60)}

`;

    const content = header + proposal;

    return {
        content,
        filename: `${metadata.projectName.replace(/\s+/g, '_')}_proposal.txt`,
        mimeType: 'text/plain'
    };
}

/**
 * Generate Word document (.docx)
 * @param {string} proposal - Proposal content
 * @param {Object} metadata - Project metadata
 * @returns {Promise<Buffer>} Word document buffer
 */
async function generateWordDocument(proposal, metadata) {
    try {
        logger.info('Generating Word document', { projectName: metadata.projectName });

        // Parse proposal into sections
        const sections = parseProposalSections(proposal);

        // Create document sections
        const docSections = [];

        // Title page
        docSections.push(
            new Paragraph({
                text: metadata.projectName,
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 }
            }),
            new Paragraph({
                text: metadata.organizationName,
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 }
            }),
            new Paragraph({
                text: `Generated: ${new Date().toLocaleDateString()}`,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            })
        );

        // Add each section
        sections.forEach(section => {
            // Section heading
            if (section.heading) {
                docSections.push(
                    new Paragraph({
                        text: section.heading,
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 240, after: 120 }
                    })
                );
            }

            // Section content - split by paragraphs
            const paragraphs = section.content.split('\n\n');
            paragraphs.forEach(para => {
                if (para.trim()) {
                    docSections.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: para.trim(),
                                    size: 24 // 12pt font
                                })
                            ],
                            spacing: { after: 120 }
                        })
                    );
                }
            });
        });

        // Create the document
        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: convertInchesToTwip(1),
                            right: convertInchesToTwip(1),
                            bottom: convertInchesToTwip(1),
                            left: convertInchesToTwip(1)
                        }
                    }
                },
                children: docSections
            }]
        });

        // Generate buffer
        const Packer = require('docx').Packer;
        const buffer = await Packer.toBuffer(doc);

        logger.info('Word document generated successfully');
        return buffer;

    } catch (error) {
        logger.error('Error generating Word document:', error.message);
        throw new Error('Failed to generate Word document');
    }
}

/**
 * Generate PDF document
 * @param {string} proposal - Proposal content
 * @param {Object} metadata - Project metadata
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generatePDF(proposal, metadata) {
    return new Promise((resolve, reject) => {
        try {
            logger.info('Generating PDF', { projectName: metadata.projectName });

            const doc = new PDFDocument({
                size: 'LETTER',
                margins: {
                    top: 72,
                    bottom: 72,
                    left: 72,
                    right: 72
                }
            });

            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                logger.info('PDF generated successfully');
                resolve(pdfBuffer);
            });
            doc.on('error', reject);

            // Title page
            doc.fontSize(24)
                .font('Helvetica-Bold')
                .text(metadata.projectName, { align: 'center' });

            doc.moveDown(0.5);
            doc.fontSize(16)
                .font('Helvetica')
                .text(metadata.organizationName, { align: 'center' });

            doc.moveDown(0.5);
            doc.fontSize(12)
                .text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });

            doc.moveDown(2);

            // Parse and add content
            const sections = parseProposalSections(proposal);

            sections.forEach((section, index) => {
                // Add page break between sections (except first)
                if (index > 0) {
                    doc.addPage();
                }

                // Section heading
                if (section.heading) {
                    doc.fontSize(18)
                        .font('Helvetica-Bold')
                        .text(section.heading);
                    doc.moveDown(0.5);
                }

                // Section content
                doc.fontSize(12)
                    .font('Helvetica')
                    .text(section.content, {
                        align: 'justify',
                        lineGap: 2
                    });

                doc.moveDown(1);
            });

            // Footer on each page
            const pages = doc.bufferedPageRange();
            for (let i = 0; i < pages.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(10)
                    .font('Helvetica')
                    .text(
                        `Page ${i + 1} of ${pages.count}`,
                        72,
                        doc.page.height - 50,
                        { align: 'center' }
                    );
            }

            doc.end();

        } catch (error) {
            logger.error('Error generating PDF:', error.message);
            reject(new Error('Failed to generate PDF'));
        }
    });
}

/**
 * Parse proposal into sections
 * @param {string} proposal - Proposal text
 * @returns {Array} Array of sections with headings and content
 */
function parseProposalSections(proposal) {
    const sections = [];
    const lines = proposal.split('\n');

    let currentSection = { heading: '', content: '' };

    lines.forEach(line => {
        const trimmed = line.trim();

        // Check if line is a heading (all caps, or ends with colon, or short and bold-looking)
        const isHeading = (
            (trimmed.length > 0 && trimmed.length < 60 && trimmed === trimmed.toUpperCase()) ||
            (trimmed.endsWith(':') && trimmed.length < 60) ||
            (trimmed.match(/^(Executive Summary|Problem Statement|Project Description|Goals|Objectives|Methodology|Timeline|Budget|Evaluation|Sustainability|Impact)/i))
        );

        if (isHeading && trimmed.length > 0) {
            // Save previous section if it has content
            if (currentSection.content.trim()) {
                sections.push({ ...currentSection });
            }
            // Start new section
            currentSection = {
                heading: trimmed.replace(/:$/, ''),
                content: ''
            };
        } else if (trimmed.length > 0) {
            currentSection.content += line + '\n';
        } else {
            currentSection.content += '\n';
        }
    });

    // Add last section
    if (currentSection.content.trim()) {
        sections.push(currentSection);
    }

    // If no sections were found, treat entire proposal as one section
    if (sections.length === 0) {
        sections.push({
            heading: 'Grant Proposal',
            content: proposal
        });
    }

    return sections;
}

/**
 * Format proposal for Google Docs
 * TODO: Implement Google Docs API integration
 * @param {string} proposal - Proposal content
 * @param {Object} metadata - Project metadata
 * @returns {Promise<string>} Google Docs URL
 */
async function exportToGoogleDocs(proposal, metadata) {
    // Placeholder - requires Google Docs API setup
    logger.warn('Google Docs export not yet implemented');
    throw new Error('Google Docs integration coming soon! Please use Word or PDF export for now.');
}

module.exports = {
    generateTextFile,
    generateWordDocument,
    generatePDF,
    exportToGoogleDocs,
    parseProposalSections
};
