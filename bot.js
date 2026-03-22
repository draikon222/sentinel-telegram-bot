const { Telegraf } = require('telegraf');
const Groq = require('groq-sdk');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const AUTHORIZED_USER = 'Draikon222';

// FUNCȚIA DE VÂNĂTOARE PE OLX (CORECȚIA ARHITECTULUI)
async function getOlxDeals(query) {
    const url = `https://www.olx.ro/oferte/q-${query}/`;
    const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' };
    try {
        const { data } = await axios.get(url, { headers });
        const $ = cheerio.load(data);
        let results = "";
        $('[data-cy="l-card"]').each((i, el) => {
            if (i < 5) {
                const title = $(el).find('h6').text().trim();
                const price = $(el).find('[data-testid="ad-price"]').text().trim();
                results += `📌 ${title.toUpperCase()} - ${price}\n`;
            }
        });
        return results || "NICIUN REZULTAT GĂSIT.";
    } catch (e) { return "EROARE: ACCES BLOCAT DE OLX."; }
}

bot.on('text', async (ctx) => {
    if (ctx.from.username !== AUTHORIZED_USER) return ctx.reply("ACCES REFUZAT.");

    const text = ctx.message.text;

    // COMANDA DE VÂNĂTOARE DIRECTĂ
    if (text.startsWith('/olx ')) {
        const query = text.replace('/olx ', '');
        const gasit = await getOlxDeals(query);
        return ctx.reply(`RAPORT VÂNĂTOARE OLX PENTRU: ${query.toUpperCase()}\n\n${gasit}`);
    }

    // LOGICA DE AI (GROQ) PENTRU ORICE ALTCEVA
    try {
        const chat = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "EȘTI NEXUS. RĂSPUNZI DOAR LUI DRAIKON222. EȘTI TĂIOS ȘI SCRII DOAR CU MAJUSCULE." },
                { role: "user", content: text }
            ],
            model: "llama3-8b-8192",
        });
        ctx.reply(chat.choices[0].message.content.toUpperCase());
    } catch (err) { ctx.reply("EROARE NUCLEU GROQ."); }
});

bot.launch();
console.log("NEXUS ONLINE - MOD VÂNĂTOR ACTIVAT");
