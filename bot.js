const { Telegraf } = require('telegraf');
const { chromium } = require('playwright');
const axios = require('axios');
const cheerio = require('cheerio');
const Groq = require('groq-sdk');

// Prevenim redeclararea dacă rulezi în consolă (HACK PROFESIONAL)
if (typeof bot === 'undefined') {
    var bot = new Telegraf(process.env.TELEGRAM_TOKEN);
}
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- COMANDĂ: CAUTA ---
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

// --- COMANDĂ: SCREENSHOT ---
bot.command('screenshot', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) return ctx.reply('🔹 /screenshot <url>');
    let browser;
    try {
        ctx.reply('📸 Nexus accesează URL...');
        browser = await chromium.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto(url.startsWith('http') ? url : `https://${url}`, { timeout: 30000 });
        const buffer = await page.screenshot();
        await ctx.replyWithPhoto({ source: buffer });
    } catch (e) { ctx.reply(`❌ Eroare Playwright.`); }
    finally { if (browser) await browser.close(); }
});

// --- INTERACȚIUNE AI ---
bot.on('text', async (ctx) => {
    try {
        const chat = await groq.chat.completions.create({
            messages: [{ role: "system", content: "Ești Nexus, tăios și profi." }, { role: "user", content: ctx.message.text }],
            model: "llama-3.3-70b-versatile",
        });
        ctx.reply(`[NEXUS]: ${chat.choices[0].message.content}`);
    } catch (e) { console.error("AI Error"); }
});

// --- LANSARE FORȚATĂ ---
bot.launch()
    .then(() => console.log("🚀 NEXUS ONLINE"))
    .catch(() => console.log("⚠️ Deja online sau eroare token."));
