const axios = require('axios');
const fs = require('fs');
const { translate } = require('@vitalets/google-translate-api');

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

(async () => {
    try {
        for (let chapterNumber = chapterStart; chapterNumber <= chapterEnd; chapterNumber++) {
            await fetchAndTranslate(chapterNumber);
        }
    } catch (error) {
        console.error('Translation process stopped due to an error.');
    }
})();
