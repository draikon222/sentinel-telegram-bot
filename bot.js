// 1. IMPORTURI
var { Telegraf } = require('telegraf');
var { chromium } = require('playwright');
var axios = require('axios');
var cheerio = require('cheerio');
var Groq = require('groq-sdk');

// 2. TRUCUL PENTRU CONSOLĂ (Rezolvă eroarea din 12222.jpg)
// Folosim 'delete' pentru a curăța memoria dacă există deja
try { delete bot; } catch(e) {}

// Folosim 'var' în loc de 'const' pentru că 'var' permite re-definirea
var bot = new Telegraf(process.env.TELEGRAM_TOKEN);
var groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 3. COMENZI (Simplificate pentru viteză)
bot.command('cauta', async (ctx) => {
    try {
        const query = ctx.message.text.split(' ').slice(1).join(' ');
        const { data } = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        let res = [];
        $('h3').each((i, el) => { if(i < 3) res.push(`📍 ${$(el).text()}`); });
        ctx.reply(res.join('\n\n') || "Niciun rezultat.");
    } catch (e) { ctx.reply('⚠️ Eroare Google.'); }
});

bot.on('text', async (ctx) => {
    try {
        const chat = await groq.chat.completions.create({
            messages: [{ role: "system", content: "Ești Nexus, tăios și profi." }, { role: "user", content: ctx.message.text }],
            model: "llama-3.3-70b-versatile",
        });
        ctx.reply(`[NEXUS]: ${chat.choices[0].message.content}`);
    } catch (e) { console.error("AI Error"); }
});

// 4. LANSARE
bot.launch()
    .then(() => console.log("🚀 NEXUS ONLINE"))
    .catch((err) => console.log("ℹ️ Deja online."));
