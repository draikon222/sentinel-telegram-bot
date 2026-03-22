const { Telegraf } = require('telegraf');
const axios = require('axios');
const cheerio = require('cheerio');
const Groq = require('groq-sdk');
const mongoose = require('mongoose');

// --- CONFIGURARE SECRETE ---
// Botul citește cheile direct din "seiful" GitHub (Secrets)
const token = process.env.TELEGRAM_TOKEN;
const mongoUri = process.env.MONGODB_URI;
const groqKey = process.env.GROQ_API_KEY;

const bot = new Telegraf(token);
const groq = new Groq({ apiKey: groqKey });

// --- CONECTARE BAZĂ DE DATE ---
mongoose.connect(mongoUri)
  .then(() => console.log('✅ Sentinela e conectată la baza de date.'))
  .catch(err => console.error('❌ Eroare bază date:', err));

// --- FUNCȚIA DE VÂNĂTOARE (SCRAPER OLX) ---
async function scrapeOLX(query) {
    try {
        const searchUrl = `https://www.olx.ro/oferte/q-${query.replace(/\s+/g, '-')}/?search%5Border%5D=filter_float_price%3Aasc`;
        const { data } = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        let results = [];

        $('[data-cy="l-card"]').each((i, el) => {
            if (i < 5) { // Luăm primele 5 cele mai ieftine
                const title = $(el).find('h6').text().trim();
                const price = $(el).find('[data-testid="ad-price"]').text().trim();
                const link = "https://www.olx.ro" + $(el).find('a').attr('href');
                if (title && price) results.push({ title, price, link });
            }
        });
        return results;
    } catch (e) {
        return null;
    }
}

// --- COMANDA PRINCIPALĂ: /olx [produs] ---
bot.command('olx', async (ctx) => {
