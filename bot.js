const { Telegraf } = require('telegraf');
const { chromium } = require('playwright');
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const Groq = require('groq-sdk');

// 1. CONFIGURARE NUCLEU
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 2. ANTI-SPAM (Protecție Procesor 97%)
let requestCount = {};
bot.use(async (ctx, next) => {
    const user = ctx.from?.id;
    const now = Date.now();
    if (user && requestCount[user] && (now - requestCount[user]) < 1500) return; 
    if (user) requestCount[user] = now;
    await next();
});

// 3. COMANDA: CAUTA (Google) - Optimizat [Ref: 12188.jpg]
bot.command('cauta', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (!query) return ctx.reply('🔹 Folosește: /cauta <termen>');
    
    try {
        const { data } = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const $ = cheerio.load(data);
        let results = [];
        $('h3').each((i, el) => { if (i < 5) results.push(`📍 ${$(el).text()}`); });
        ctx.reply(`🔍 Rezultate pentru "${query}":\n\n${results.join('\n\n')}`);
    } catch (e) {
        ctx.reply('⚠️ Google a limitat accesul temporar.');
    }
});

// 4. COMANDA: SCREENSHOT (Playwright Render-Ready) - Optimizat [Ref: 12184.jpg]
bot.command('screenshot', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) return ctx.reply('🔹 Folosește: /screenshot <url>');

    let browser;
    try {
        ctx.reply('📸 Nexus accesează URL-ul... Așteaptă.');
        browser = await chromium.launch({ 
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] 
        });
        const page = await browser.newPage();
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.goto(url.startsWith('http') ? url : `https://${url}`, { waitUntil: 'networkidle', timeout: 30000 });
        const buffer = await page.screenshot();
        await ctx.replyWithPhoto({ source: buffer }, { caption: `✅ Captură realizată: ${url}` });
    } catch (e) {
        ctx.reply(`❌ Eroare: ${e.message.substring(0, 50)}`);
    } finally {
        if (browser) await browser.close(); // ELIBEREAZĂ RAM-UL (Vital!)
    }
});

// 5. COMANDA: WIKI - [Ref: 12181.jpg]
bot.command('wiki', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join('_');
    if (!query) return ctx.reply('🔹 Folosește: /wiki <subiect>');
    try {
        const { data } = await axios.get(`https://ro.wikipedia.org/wiki/${query}`);
        const $ = cheerio.load(data);
        const text = $('.mw-parser-output p').first().text().substring(0, 800);
        ctx.reply(`📚 WIKIPEDIA:\n\n${text}...`);
    } catch (e) {
        ctx.reply('❌ Subiectul nu a fost găsit.');
    }
});

// 6. AI INTERACTION (Nexus Core)
bot.on('text', async (ctx) => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "system", content: "Ești Nexus, cel mai bun coder. Răspunde tăios și precis." },
                       { role: "user", content: ctx.message.text }],
            model: "llama-3.3-70b-versatile",
        });
        ctx.reply(`[NEXUS]: ${completion.choices[0].message.content}`);
    } catch (e) { console.error(e); }
});

// 7. LANSARE
bot.launch().then(() => console.log("🚀 NEXUS OPERAȚIONAL: Toate modulele pornite."));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
