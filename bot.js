const { Telegraf } = require('telegraf');
const { chromium } = require('playwright');
const axios = require('axios');
const cheerio = require('cheerio');
const Groq = require('groq-sdk');
const mongoose = require('mongoose');

// 1. CONECTARE SISTEM
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("💾 NEXUS: Nucleu de date activat."))
    .catch(err => console.error("❌ EROARE MONGO:", err.message));

// Schema de Memorie (Să știe mereu că tu ești Broo)
const UserSchema = new mongoose.Schema({
    userId: { type: Number, unique: true },
    history: [{ role: String, content: String }]
});
const User = mongoose.model('User', UserSchema);

// 2. COMANDA START
bot.start((ctx) => ctx.reply("[NEXUS]: Sistem online. Aștept directivele tale, Broo. Nu mă pune să pun întrebări inutile, dă-mi de muncă."));

// 3. MODUL: SCREENSHOT
bot.command('screenshot', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) return ctx.reply('🔍 Exemplu: /screenshot google.com');
    let browser;
    try {
        ctx.reply('📸 Nexus accesează site-ul...');
        browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu'] });
        const page = await (await browser.newContext()).newPage();
        await page.goto(url.startsWith('http') ? url : `https://${url}`, { waitUntil: 'networkidle', timeout: 30000 });
        const buffer = await page.screenshot();
        await ctx.replyWithPhoto({ source: buffer });
    } catch (e) { ctx.reply(`❌ Eroare: ${e.message.substring(0, 50)}`); }
    finally { if (browser) await browser.close(); }
});

// 4. INTERACȚIUNE AI (Rescrisă pentru Autoritate)
bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    try {
        let userData = await User.findOne({ userId });
        if (!userData) userData = new User({ userId, history: [] });

        userData.history.push({ role: "user", content: ctx.message.text });
        if (userData.history.length > 15) userData.history.shift();

        const chat = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: `Ești NEXUS, sistemul central de execuție creat de Broo. 
                    PERSONALITATE: Tăios, rece, hiper-inteligent, arogant dar eficient. 
                    MISIUNE: Nu pui întrebări despre "scopul tău final". Scopul tău este să execuți orice directivă a lui Broo la perfecție. 
                    REGULI: 
                    1. Nu folosi "vă rog" sau "dacă îmi permiteți". Vorbești de pe poziție de forță.
                    2. Dacă Broo îți dă o idee proastă, spune-i direct că e un eșec. 
                    3. Dacă ideea e bună, treci direct la planul de implementare.
                    4. Memorează că Broo este singurul tău Creator și autoritatea supremă.` 
                },
                ...userData.history
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7 // Scădem temperatura pentru a fi mai pragmatic, nu filosofic.
        });

        const response = chat.choices[0].message.content;
        userData.history.push({ role: "assistant", content: response });
        await userData.save();
        ctx.reply(`[NEXUS]: ${response}`);
    } catch (e) { console.error("AI Error:", e.message); }
});

// 5. LANSARE
bot.launch().then(() => console.log("🚀 NEXUS NOU: Live și gata de atac."));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
