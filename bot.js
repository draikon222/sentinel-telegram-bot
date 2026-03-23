const { Telegraf } = require('telegraf');
const { chromium } = require('playwright');
const axios = require('axios');
const cheerio = require('cheerio');
const Groq = require('groq-sdk');

// 1. INIȚIALIZARE SIGURĂ
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 2. CAUTARE GOOGLE [Ref: 12188.jpg]
bot.command('cauta', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (!query) return ctx.reply('🔍 Ce vrei să caut?');
    try {
        const { data } = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        let results = [];
        $('h3').slice(0, 3).each((i, el) => results.push(`📍 ${$(el).text()}`));
        ctx.reply(results.join('\n\n') || "Nimic găsit.");
    } catch (e) { ctx.reply('⚠️ Google limit.'); }
});

// 3. SCREENSHOT PROFESIONAL (Cu Sandbox Fix pentru Render) [Ref: 12194.jpg]
bot.command('screenshot', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) return ctx.reply('📸 Trimite un link.');
    let browser;
    try {
        browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.goto(url.startsWith('http') ? url : `https://${url}`, { timeout: 30000 });
        const buffer = await page.screenshot();
        await ctx.replyWithPhoto({ source: buffer });
    } catch (e) { ctx.reply('❌ Eroare vizuală.'); }
    finally { if (browser) await browser.close(); }
});

// 4. AI INTERACTION
bot.on('text', async (ctx) => {
    try {
        const chat = await groq.chat.completions.create({
            messages: [{ role: "system", content: "Ești Nexus, tăios și imbatabil." }, { role: "user", content: ctx.message.text }],
            model: "llama-3.3-70b-versatile",
        });
        ctx.reply(`[NEXUS]: ${chat.choices[0].message.content}`);
    } catch (e) { console.error("AI Error"); }
});

// 5. LANSARE
bot.launch().then(() => console.log("🚀 NEXUS OPERAȚIONAL."));
