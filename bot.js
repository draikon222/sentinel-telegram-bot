const { Telegraf } = require('telegraf');
const Groq = require('groq-sdk');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

// CONFIGURARE NUCLEU
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const AUTHORIZED_USER = 'Draikon222'; // SECURITATE: DOAR TU [cite: 2026-03-22]

// FUNȚIA DE VÂNĂTOARE (SCRAPING) PE OLX
async function getOlxDeals(query) {
    const url = `https://www.olx.ro/oferte/q-${query.replace(/\s+/g, '-')}/`;
    const headers = { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' 
    };

    try {
        const { data } = await axios.get(url, { headers });
        const $ = cheerio.load(data);
        let results = "";

        // SELECTORII ACTUali OLX [cite: 2026-03-22]
        $('[data-cy="l-card"]').each((i, el) => {
            if (i < 5) { // LIMITĂ DE 5 REZULTATE PENTRU EFICIENȚĂ
                const title = $(el).find('h6').text().trim();
                const price = $(el).find('[data-testid="ad-price"]').text().trim();
                const link = $(el).find('a').attr('href');
                const fullLink = link.startsWith('http') ? link : 'https://www.olx.ro' + link;
                
                if (title && price) {
                    results += `📌 ${title.toUpperCase()}\n💰 PREȚ: ${price}\n🔗 ${fullLink}\n\n`;
                }
            }
        });

        return results || "NICIUN REZULTAT GĂSIT PENTRU CĂUTAREA TA.";
    } catch (e) {
        console.error("EROARE SCRAPING:", e.message);
        return "⚠️ EROARE: ACCESUL LA OLX A FOST REFUZAT SAU SITE-UL S-A SCHIMBAT.";
    }
}

// LOGICA DE RĂSPUNS
bot.on('text', async (ctx) => {
    // FILTRU DE SECURITATE [cite: 2026-03-22]
    if (ctx.from.username !== AUTHORIZED_USER) {
        return ctx.reply("ACCES REFUZAT. DOAR PENTRU BROO.");
    }

    const text = ctx.message.text;

    // COMANDA DE VÂNĂTOARE DIRECTĂ
    if (text.startsWith('/olx ')) {
        const query = text.replace('/olx ', '');
        await ctx.reply(`🔍 VÂNEZ PE OLX PENTRU: ${query.toUpperCase()}...`);
        const gasit = await getOlxDeals(query);
        return ctx.reply(gasit);
    }

    // LOGICA DE AI (GROQ) PENTRU DISCUȚII ȘI STRATEGIE
    try {
        const chat = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "EȘTI SENTINELA, EXECUTANTUL LUI DRAIKON222. RĂSPUNZI TĂIOS, REALIST ȘI DOAR CU MAJUSCULE. DACĂ UTILIZATORUL CERE /OLX, ÎNSEAMNĂ CĂ VREA SĂ CAUTE PRODUSE." 
                },
                { role: "user", content: text }
            ],
            model: "llama3-8b-8192",
            temperature: 0.2
        });

        const response = chat.choices[0].message.content.toUpperCase();
        await ctx.reply(response);
    } catch (err) {
        console.error("EROARE GROQ:", err);
        ctx.reply("⚠️ EROARE LA NUCLEUL DE INTELIGENȚĂ.");
    }
});

// PORNIRE BOT
bot.launch();
console.log("SENTINELA ONLINE - MOD VÂNĂTOR ACTIVAT PENTRU DRAIKON222");

// OPRIRE SIGURĂ
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
