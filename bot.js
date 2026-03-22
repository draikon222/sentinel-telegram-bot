const { Telegraf } = require('telegraf');
const Groq = require('groq-sdk');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const AUTHORIZED_USER = 'Draikon222';

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
                if (title) results += `📌 ${title.toUpperCase()} - ${price}\n`;
            }
        });
        return results || "NICIUN REZULTAT GĂSIT PE OLX.";
    } catch (e) { return "EROARE CRITICĂ: ACCES BLOCAT DE OLX."; }
}

bot.on('text', async (ctx) => {
    // DOAR TU ÎL POȚI CONTROLA
    if (ctx.from.username !== AUTHORIZED_USER) return ctx.reply("ACCES REFUZAT.");

    const text = ctx.message.text;

    // COMANDA DE CĂUTARE PE OLX
    if (text.startsWith('/olx ')) {
        const query = text.replace('/olx ', '');
        const gasit = await getOlxDeals(query);
        return ctx.reply(`RAPORT SENTINELA OLX: ${query.toUpperCase()}\n\n${gasit}`);
    }

    // LOGICA DE AI PENTRU DISCUȚII
    try {
        const chat = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "EȘTI SENTINELA LUI DRAIKON222. RĂSPUNZI TĂIOS, REALIST ȘI DOAR CU MAJUSCULE." },
                { role: "user", content: text }
            ],
            model: "llama3-8b-8192",
        });
        ctx.reply(chat.choices[0].message.content.toUpperCase());
    } catch (err) { ctx.reply("EROARE NUCLEU GROQ."); }
});

bot.launch();
console.log("SENTINELA ONLINE - GATA DE VÂNĂTOARE");
