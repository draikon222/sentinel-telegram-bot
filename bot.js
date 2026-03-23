// 1. IMPORTURI
var { Telegraf } = require('telegraf');
var { chromium } = require('playwright');
var axios = require('axios');
var cheerio = require('cheerio');
var Groq = require('groq-sdk');

// 2. EVITARE EROARE RE-DECLARARE (Soluția pentru 12221.jpg)
// Folosim 'global' pentru a verifica dacă 'bot' a fost deja injectat în memorie
if (!global.botInstance) {
    global.botInstance = new Telegraf(process.env.TELEGRAM_TOKEN);
    console.log("🚀 [NEXUS]: Instanță nouă creată.");
} else {
    console.log("♻️ [NEXUS]: Instanță existentă detectată. Reutilizare...");
}
var bot = global.botInstance;
var groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 3. COMANDA: CAUTA
bot.command('cauta', async (ctx) => {
    try {
        const query = ctx.message.text.split(' ').slice(1).join(' ');
        const { data } = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        let res = [];
        $('h3').each((i, el) => { if(i < 3) res.push(`📍 ${$(el).text()}`); });
        ctx.reply(results.join('\n\n') || "Niciun rezultat.");
    } catch (e) { ctx.reply('⚠️ Eroare Google.'); }
});

// 4. INTERACȚIUNE AI
bot.on('text', async (ctx) => {
    try {
        const chat = await groq.chat.completions.create({
            messages: [{ role: "system", content: "Ești Nexus, tăios și profi." }, { role: "user", content: ctx.message.text }],
            model: "llama-3.3-70b-versatile",
        });
        ctx.reply(`[NEXUS]: ${chat.choices[0].message.content}`);
    } catch (e) { console.error("AI Error"); }
});

// 5. LANSARE SIGURĂ
bot.launch()
    .then(() => console.log("✅ SISTEM OPERAȚIONAL"))
    .catch((err) => console.log("ℹ️ Botul rulează deja."));
