const express = require('express');
const axios = require('axios');
const fs = require('fs');
const { translate } = require('@vitalets/google-translate-api');
const archiver = require('archiver');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const chapterStart = 457;
const chapterEnd = 726;
const baseUrl = 'https://ncode.syosetu.com/n1578dx/';

async function fetchAndTranslate(chapterNumber) {
    const chapterUrl = `${baseUrl}${chapterNumber}/`;

    try {
        const response = await axios.get(chapterUrl);
        const text = response.data;

        // Translate the text
        const translatedText = await translate(text, { from: 'ja', to: 'en' });

        // Save the text to a file
        const fileName = `txtvols/volume_${chapterNumber}.txt`;
        fs.writeFileSync(fileName, translatedText.text);

        console.log(`Chapter ${chapterNumber} translated and saved.`);
    } catch (error) {
        console.error(`Error fetching or translating chapter ${chapterNumber}: ${error.message}`);
        throw error; // Rethrow the error to stop further processing
    }
}

async function downloadNovel(req, res) {
    const outputZip = path.join(__dirname, 'novel.zip');
    const outputFolder = path.join(__dirname, 'txtvols');

    // Fetch and translate chapters
    try {
        for (let chapterNumber = chapterStart; chapterNumber <= chapterEnd; chapterNumber++) {
            await fetchAndTranslate(chapterNumber);
        }

        // Create a zip file of the folder
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level
        });
        
        archive.directory(outputFolder, false);
        archive.pipe(fs.createWriteStream(outputZip));
        archive.finalize();

        // Wait for the zip file to be created
        archive.on('finish', () => {
            // Send the zip file for download
            res.download(outputZip, 'novel.zip', (err) => {
                if (err) {
                    console.error('Error sending zip file:', err);
                    res.status(500).send('Error downloading the novel.');
                } else {
                    console.log('Novel zip file sent successfully.');
                }
            });
        });
    } catch (error) {
        console.error('Translation process stopped due to an error.');
        res.status(500).send('Error downloading the novel.');
    }
}

// Route to trigger downloadNovel function
app.get('/downloadnovel', downloadNovel);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
