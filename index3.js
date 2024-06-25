const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit'); // Require fontkit for font handling

const chapterStart = 313;
const chapterEnd = 456;
const customFontPath = './ubuntu.ttf'; // Path to your custom font file

async function txtToPdf(chapterNumber) {
    try {
        const txtFilePath = `txtvols/textvolume${chapterNumber}.txt`;
        const pdfFilePath = `volumes/volume_${chapterNumber}.pdf`;

        // Read the text content from the .txt file
        const textContent = fs.readFileSync(txtFilePath, 'utf-8');
        
        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();

        // Register fontkit with PDFDocument
        pdfDoc.registerFontkit(fontkit);

        // Embed the custom font
        const fontBytes = fs.readFileSync(customFontPath);
        const customFont = await pdfDoc.embedFont(fontBytes);
        
        // Add a new page to the document
        let page = pdfDoc.addPage();
        
        // Set font and text options
        const fontSize = 12;
        
        // Split text into lines and calculate dimensions
        const textLines = textContent.split('\n');
        const lineHeight = customFont.heightAtSize(fontSize);
        
        // Position text on the page
        let textX = 50;
        let textY = page.getHeight() - 50; // Start at the top of the page
        
        // Draw each line of text on the page
        for (const line of textLines) {
            if (textY < 50) {
                // Add a new page if the text reaches the bottom margin
                page = pdfDoc.addPage();
                textY = page.getHeight() - 50; // Reset Y position for new page
            }
            
            page.drawText(line, {
                x: textX,
                y: textY,
                size: fontSize,
                font: customFont,
                color: rgb(0, 0, 0), // Black color
            });
            
            // Move Y position to the next line
            textY -= lineHeight;
        }
        
        // Serialize the PDFDocument to bytes
        const pdfBytes = await pdfDoc.save();
        
        // Write the bytes to a PDF file
        fs.writeFileSync(pdfFilePath, pdfBytes);
        
        console.log(`PDF file "${pdfFilePath}" created successfully.`);
    } catch (error) {
        console.error(`Error converting text to PDF for chapter ${chapterNumber}:`, error);
    }
}

// Convert each chapter's text file to PDF
async function convertAllChapters() {
    for (let chapterNumber = chapterStart; chapterNumber <= chapterEnd; chapterNumber++) {
        await txtToPdf(chapterNumber);
    }
}

// Start the conversion process
convertAllChapters().catch((error) => {
    console.error('Error converting chapters to PDF:', error);
});
