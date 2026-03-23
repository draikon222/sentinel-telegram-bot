const { Telegraf } = require('telegraf');
const { chromium } = require('playwright');
const axios = require('axios');
const cheerio = require('cheerio');
const Groq = require('groq-sdk');

// 1. DEFINIREA NUCLEULUI (Trebuie să fie PRIMA)
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 2. MODUL: CAUTA (Google)
bot.command('cauta', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (!query) return ctx.reply('🔹 /cauta <termen>');
    try {
        const { data } = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        let rez = [];
        $('h3').each((i, el) => { if(i < 5) rez.push(`📍 ${$(el).text()}`); });
        ctx.reply(rez.join('\n\n') || "Niciun rezultat.");
    } catch (e) { ctx.reply('⚠️ Eroare Google.'); }
});

// 3. MODUL: SCREENSHOT (Render-Ready)
bot.command('screenshot', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) return ctx.reply('🔹 /screenshot <url>');
    let browser;
    try {
        ctx.reply('📸 Nexus procesează vizual...');
        browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.goto(url.startsWith('http') ? url : `https://${url}`, { timeout: 30000 });
        const buffer = await page.screenshot();
        await ctx.replyWithPhoto({ source: buffer });
    } catch (e) { ctx.reply(`❌ Eroare: ${e.message.substring(0, 30)}`); }
    finally { if (browser) await browser.close(); }
});

// 4. MODUL: WIKI
bot.command('wiki', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join('_');
    try {
        const { data } = await axios.get(`https://ro.wikipedia.org/wiki/${query}`);
        const $ = cheerio.load(data);
        ctx.reply($('.mw-parser-output p').first().text().substring(0, 500));
    } catch (e) { ctx.reply('❌ Negăsit.'); }
});

// 5. INTERACȚIUNE INTELIGENTĂ (Nexus AI)
bot.on('text', async (ctx) => {
    try {
        const chat = await groq.chat.completions.create({
            messages: [{ role: "system", content: "Ești Nexus, cel mai bun coder. Răspunde tăios." },
                       { role: "user", content: ctx.message.text }],
            model: "llama-3.3-70b-versatile",
        });
        ctx.reply(`[NEXUS]: ${chat.choices[0].message.content}`);
    } catch (e) { console.error("AI Error"); }
});

// 6. LANSARE
bot.launch().then(() => console.log("🚀 NEXUS: Pornire reușită."));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
