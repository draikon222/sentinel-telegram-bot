// 1. IMPORTURI
var { Telegraf } = require('telegraf');
var { chromium } = require('playwright');
var axios = require('axios');
var cheerio = require('cheerio');
var Groq = require('groq-sdk');

// 2. LOGICĂ ANTI-REDECLARARE (Fix pentru 12225.jpg)
// Folosim un bloc try-catch global pentru a preveni crash-ul la redeclarare
try {
    if (typeof bot === 'undefined') {
        // Dacă nu există, îl creăm
        var bot = new Telegraf(process.env.TELEGRAM_TOKEN);
        console.log("🚀 Instanță nouă creată.");
    } else {
        console.log("♻️ Instanță detectată. Reutilizare...");
    }
} catch (e) {
    console.log("⚠️ Eroare la inițializare: " + e.message);
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 3. MODUL: CAUTA (Optimizat)
bot.command('cauta', async (ctx) => {
    try {
        const query = ctx.message.text.split(' ').slice(1).join(' ');
        if (!query) return ctx.reply('🔹 Ce cauți?');
        const { data } = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        let res = [];
        $('h3').each((i, el) => { if(i < 3) res.push(`📍 ${$(el).text()}`); });
        ctx.reply(res.join('\n\n') || "Niciun rezultat.");
    } catch (e) { ctx.reply('⚠️ Google a blocat cererea.'); }
});

// 4. INTERACȚIUNE AI
bot.on('text', async (ctx) => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "system", content: "Ești Nexus, tăios și profi." }, { role: "user", content: ctx.message.text }],
            model: "llama-3.3-70b-versatile",
        });
        ctx.reply(`[NEXUS]: ${completion.choices[0].message.content}`);
    } catch (e) { console.error("AI Error"); }
});

// 5. PORNIRE REZISTENTĂ
bot.launch()
    .then(() => console.log("✅ SISTEM OPERAȚIONAL"))
    .catch((err) => console.log("ℹ️ Botul rulează deja în fundal."));
