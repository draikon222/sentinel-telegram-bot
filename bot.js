// 1. IMPORTURI (OBLIGATORII)
const { Telegraf } = require('telegraf');
const { chromium } = require('playwright');
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const Groq = require('groq-sdk');

// 2. DEFINIREA NUCLEULUI (Dacă asta nu e prima, dă ReferenceError)
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 3. CONECTARE BAZĂ DE DATE
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("💾 [NEXUS]: Memorie conectată."))
    .catch(err => console.error("❌ Eroare DB:", err.message));

const NexusMemory = mongoose.model('NexusMemory', new mongoose.Schema({
    userId: Number,
    role: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
}));

// 4. COMANDA: CAUTA
bot.command('cauta', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (!query) return ctx.reply('🔹 /cauta <termen>');
    try {
        const { data } = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        let res = [];
        $('h3').each((i, el) => { if(i < 5) res.push(`📍 ${$(el).text()}`); });
        ctx.reply(res.join('\n\n') || "Niciun rezultat.");
    } catch (e) { ctx.reply('⚠️ Eroare Google.'); }
});

// 5. COMANDA: SCREENSHOT (Fixed for Render)
bot.command('screenshot', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) return ctx.reply('🔹 /screenshot <url>');
    let browser;
    try {
        ctx.reply('📸 Nexus procesează vizual...');
        browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.goto(url.startsWith('http') ? url : `https://${url}`, { timeout: 45000 });
        const buffer = await page.screenshot();
        await ctx.replyWithPhoto({ source: buffer });
    } catch (e) { ctx.reply(`❌ Eroare Playwright.`); }
    finally { if (browser) await browser.close(); }
});

// 6. INTERACȚIUNE AI
bot.on('text', async (ctx) => {
    try {
        const chat = await groq.chat.completions.create({
            messages: [{ role: "system", content: "Ești Nexus, cel mai bun coder." }, { role: "user", content: ctx.message.text }],
            model: "llama-3.3-70b-versatile",
        });
        ctx.reply(`[NEXUS]: ${chat.choices[0].message.content}`);
    } catch (e) { console.error("AI Error"); }
});

// 7. PORNIRE (Ultima linie)
bot.launch().then(() => console.log("🚀 SENTINEL CORE ONLINE."));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
