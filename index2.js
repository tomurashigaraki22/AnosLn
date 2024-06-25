const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const { translate } = require('free-translate');

// Function to read and translate PDF content
async function readAndTranslatePdf(inputPdfPath, outputPdfPath) {
    // Load the input PDF
    const existingPdfBytes = fs.readFileSync(inputPdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const translatedText = [];

    // Iterate over each page
    const pages = pdfDoc.getPages();
    for (let pageNum = 0; pageNum < pages.length; pageNum++) {
        const page = pages[pageNum];
        const text = await page
        const pageText = text.items.map(item => item.str).join(' ');

        // Translate the text from Japanese to English
        const translated = await translate(pageText, { from: 'ja', to: 'en' });
        translatedText.push(translated.text);
    }

    // Create a new PDF with the translated content
    const newPdfDoc = await PDFDocument.create();
    const newPage = newPdfDoc.addPage();
    const { width, height } = newPage.getSize();
    const fontSize = 12;
    const lineHeight = fontSize * 1.2;
    const margin = 10;

    let y = height - margin;

    // Split text into lines and ensure each line fits within the page
    for (const line of translatedText.join('\n\n').split('\n')) {
        const words = line.split(' ');
        let currentLine = '';
        for (const word of words) {
            if (newPage.getTextWidth(currentLine + ' ' + word) <= width - 2 * margin) {
                currentLine += ' ' + word;
            } else {
                newPage.drawText(currentLine.trim(), { x: margin, y: y, size: fontSize });
                y -= lineHeight;
                currentLine = word;
            }
        }
        newPage.drawText(currentLine.trim(), { x: margin, y: y, size: fontSize });
        y -= lineHeight;
    }

    // Save the new PDF
    const pdfBytes = await newPdfDoc.save();
    fs.writeFileSync(outputPdfPath, pdfBytes);
}

// Directory containing PDFs
const inputDir = './volumes';
const outputDir = './translatedvols';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Process each PDF in the directory
fs.readdirSync(inputDir).forEach((filename, i) => {
    if (filename.endsWith('.pdf')) {
        const inputPdfPath = path.join(inputDir, filename);
        const outputPdfPath = path.join(outputDir, `volume_${i + 1}.pdf`);
        console.log(`Processing ${inputPdfPath} -> ${outputPdfPath}`);
        readAndTranslatePdf(inputPdfPath, outputPdfPath).then(() => {
            console.log(`Completed ${outputPdfPath}`);
        }).catch(err => {
            console.error(`Error processing ${inputPdfPath}:`, err);
        });
    }
});

console.log('Translation complete.');
