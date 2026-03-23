const { Telegraf } = require('telegraf');
const { chromium } = require('playwright');
const axios = require('axios');
const cheerio = require('cheerio');
const Groq = require('groq-sdk');

// 1. CONFIGURARE NUCLEU
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 2. MODUL SCREENSHOT (Lianul Chromium pentru Render)
bot.command('screenshot', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) return ctx.reply('🔍 Trimite un link, Broo.');

    let browser;
    try {
        ctx.reply('📸 Nexus accesează Chromium pe server...');
        
        // AICI ESTE LEGĂTURA CRITICĂ PENTRU LINUX/RENDER
        browser = await chromium.launch({ 
            headless: true, 
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox', 
                '--disable-dev-shm-usage', // Previne crash-ul de memorie pe Render
                '--disable-gpu'
            ] 
        });

        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 }
        });
        const page = await context.newPage();
        
        const targetUrl = url.startsWith('http') ? url : `https://${url}`;
        await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
        
        const buffer = await page.screenshot({ fullPage: false });
        await ctx.replyWithPhoto({ source: buffer }, { caption: `✅ Captură: ${targetUrl}` });

    } catch (e) {
        console.error(e);
        ctx.reply(`❌ Eroare Chromium: ${e.message.includes('executable') ? 'Browser neinstalat. Verifică package.json!' : 'Link invalid.'}`);
    } finally {
        if (browser) await browser.close();
    }
});

// 3. CAUTA (GOOGLE)
bot.command('cauta', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (!query) return ctx.reply('🔎 Ce să caut?');
    try {
        const { data } = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        let links = [];
        $('h3').slice(0, 3).each((i, el) => links.push(`📍 ${$(el).text()}`));
        ctx.reply(links.join('\n\n') || "Nimic găsit.");
    } catch (e) { ctx.reply('⚠️ Eroare search.'); }
});

// 4. AI INTERACTION
bot.on('text', async (ctx) => {
    try {
        const chat = await groq.chat.completions.create({
            messages: [{ role: "system", content: "Ești Nexus, tăios și profi." }, { role: "user", content: ctx.message.text }],
            model: "llama-3.3-70b-versatile",
        });
        ctx.reply(`[NEXUS]: ${chat.choices[0].message.content}`);
    } catch (e) { console.error("AI Error"); }
});

bot.launch().then(() => console.log("🚀 NEXUS: Sistem vizual și logic activ."));
