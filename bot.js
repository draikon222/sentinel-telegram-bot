(async () => {
    const { Telegraf } = require('telegraf');
    const { chromium } = require('playwright');
    const axios = require('axios');
    const cheerio = require('cheerio');
    const Groq = require('groq-sdk');

    // Forțăm curățarea dacă e posibil sau reutilizarea
    if (!global.nexusBot) {
        global.nexusBot = new Telegraf(process.env.TELEGRAM_TOKEN);
        console.log("🚀 Instanță nouă creată.");
    }
    
    const bot = global.nexusBot;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // COMANDA CAUTA
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
        } catch (e) { ctx.reply('⚠️ Eroare.'); }
    });

    // INTERACȚIUNE AI
    bot.on('text', async (ctx) => {
        try {
            const chat = await groq.chat.completions.create({
                messages: [{ role: "system", content: "Ești Nexus, tăios și profi." }, { role: "user", content: ctx.message.text }],
                model: "llama-3.3-70b-versatile",
            });
            ctx.reply(`[NEXUS]: ${chat.choices[0].message.content}`);
        } catch (e) { console.error("AI Error"); }
    });

    try {
        await bot.launch();
        console.log("✅ SISTEM ONLINE.");
    } catch (err) {
        console.log("ℹ️ Nexus rulează deja.");
    }
})();
