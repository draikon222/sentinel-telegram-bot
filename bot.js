const { Telegraf } = require('telegraf');
const { chromium } = require('playwright');
const axios = require('axios');
const cheerio = require('cheerio');
const Groq = require('groq-sdk');

// 1. INIȚIALIZARE NUCLEU
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 2. MODUL: SCREENSHOT (Legătura Profi cu Chromium)
bot.command('screenshot', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) return ctx.reply('🔍 Exemplu: /screenshot google.com');

    let browser;
    try {
        ctx.reply('📸 Nexus accesează Chromium...');

        // ACEASTA ESTE LEGĂTURA CRITICĂ PENTRU RENDER/LINUX
        browser = await chromium.launch({ 
            headless: true, 
            args: [
                '--no-sandbox',             // OBLIGATORIU pe Linux/Render
                '--disable-setuid-sandbox',    // Permite rularea fără privilegii root
                '--disable-dev-shm-usage',     // Previne crash-ul de memorie (RAM limitat)
                '--disable-gpu'                // Economisește resurse pe server
            ] 
        });

        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 }
        });
        const page = await context.newPage();
        
        const targetUrl = url.startsWith('http') ? url : `https://${url}`;
        
        // Timeout de 30s pentru a nu bloca procesul
        await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
        
        const buffer = await page.screenshot({ fullPage: false });
        await ctx.replyWithPhoto({ source: buffer }, { caption: `✅ Sursă: ${targetUrl}` });

    } catch (e) {
        console.error("Eroare Playwright:", e.message);
        // Nexus te anunță exact dacă ai uitat să instalezi browserul
        if (e.message.includes('executable')) {
            ctx.reply('❌ EROARE: Browserul nu este instalat pe server. Verifică Build Command în Render!');
        } else {
            ctx.reply(`❌ Eroare: ${e.message.substring(0, 60)}`);
        }
    } finally {
        if (browser) await browser.close(); // Eliberează RAM imediat
    }
});

// 3. MODUL: CAUTA (Google Scraper)
bot.command('cauta', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (!query) return ctx.reply('🔎 Ce cauți?');
    try {
        const { data } = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        let results = [];
        $('h3').slice(0, 4).each((i, el) => results.push(`📍 ${$(el).text()}`));
        ctx.reply(`Rezultate Google:\n\n${results.join('\n\n')}`);
    } catch (e) { ctx.reply('⚠️ Eroare la căutare.'); }
});

// 4. INTERACȚIUNE AI (Nexus Core)
bot.on('text', async (ctx) => {
    try {
        const chat = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "Ești Nexus, tăios, realist și cel mai bun coder Sentinel Core." },
                { role: "user", content: ctx.message.text }
            ],
            model: "llama-3.3-70b-versatile",
        });
        ctx.reply(`[NEXUS]: ${chat.choices[0].message.content}`);
    } catch (e) { console.error("AI Error:", e.message); }
});

// 5. LANSARE SISTEM
bot.launch()
    .then(() => console.log("🚀 NEXUS: Toate sistemele sunt online."))
    .catch(err => console.error("❌ Eroare la pornire:", err.message));

// Închidere sigură
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
