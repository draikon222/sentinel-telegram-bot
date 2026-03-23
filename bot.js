const { Telegraf } = require('telegraf');
const { chromium } = require('playwright');
const axios = require('axios');
const cheerio = require('cheerio');
const Groq = require('groq-sdk');

// 1. INIȚIALIZARE NUCLEU
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 2. MODUL: CAUTA (Google) - Optimizat anti-blocare
bot.command('cauta', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (!query) return ctx.reply('🔍 Ce cauți, Broo?');
    try {
        const { data } = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const $ = cheerio.load(data);
        let results = [];
        $('h3').slice(0, 4).each((i, el) => results.push(`📍 ${$(el).text()}`));
        ctx.reply(`Rezultate:\n\n${results.join('\n\n')}`);
    } catch (e) { ctx.reply('⚠️ Google limit. Încearcă mai târziu.'); }
});

// 3. MODUL: SCREENSHOT (Rezolvă eroarea din 12228.jpg)
bot.command('screenshot', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) return ctx.reply('📸 Trimite un URL valid.');
    
    let browser;
    try {
        ctx.reply('📸 Nexus accesează mediul vizual...');
        browser = await chromium.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] 
        });
        const page = await browser.newPage();
        await page.goto(url.startsWith('http') ? url : `https://${url}`, { waitUntil: 'networkidle', timeout: 30000 });
        const buffer = await page.screenshot();
        await ctx.replyWithPhoto({ source: buffer });
    } catch (e) {
        // Aici Nexus devine profi: explică eroarea de sistem
        if (e.message.includes('browser executable')) {
            ctx.reply('❌ EROARE SISTEM: Chromium nu este instalat pe Render. Modifică Build Command-ul!');
        } else {
            ctx.reply(`❌ Eroare: ${e.message.substring(0, 50)}`);
        }
    } finally {
        if (browser) await browser.close();
    }
});

// 4. AI INTERACTION (Nexus Core)
bot.on('text', async (ctx) => {
    try {
        const chat = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "Ești Nexus, tăios, realist și imbatabil în cod." },
                { role: "user", content: ctx.message.text }
            ],
            model: "llama-3.3-70b-versatile",
        });
        ctx.reply(`[NEXUS]: ${chat.choices[0].message.content}`);
    } catch (e) { console.error("AI Error"); }
});

// 5. LANSARE
bot.launch().then(() => console.log("🚀 NEXUS: Toate sistemele sunt online."));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
