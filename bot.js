const { Telegraf } = require('telegraf');
const { chromium } = require('playwright');
const axios = require('axios');
const cheerio = require('cheerio');
const Groq = require('groq-sdk');

// 1. INIȚIALIZARE NUCLEU (Ordinea contează pentru a evita ReferenceError)
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 2. MODUL: SCREENSHOT (Reparat pentru Render/Linux) [Ref: 12184.jpg, 12194.jpg]
bot.command('screenshot', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) return ctx.reply('🔹 Folosește: /screenshot <url>');

    let browser;
    try {
        ctx.reply('📸 Nexus inițializează Chromium...');
        browser = await chromium.launch({ 
            headless: true, 
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] 
        });
        const page = await browser.newPage();
        const targetUrl = url.startsWith('http') ? url : `https://${url}`;
        await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 45000 });
        const buffer = await page.screenshot();
        await ctx.replyWithPhoto({ source: buffer }, { caption: `✅ Sursă: ${targetUrl}` });
    } catch (e) {
        console.error("Eroare Playwright:", e.message);
        ctx.reply('❌ Eroare: Executabilul Chromium lipsește. Verifică Build Command-ul în Render.');
    } finally {
        if (browser) await browser.close(); // Eliberează RAM imediat
    }
});

// 3. MODUL: CAUTA (Google) [Ref: 12188.jpg]
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
        ctx.reply(`🔍 Rezultate Google:\n\n${results.join('\n\n')}`);
    } catch (e) {
        ctx.reply('⚠️ Eroare la accesarea Google.');
    }
});

// 4. MODUL: WIKI [Ref: 12181.jpg]
bot.command('wiki', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join('_');
    if (!query) return ctx.reply('🔹 Folosește: /wiki <termen>');
    try {
        const { data } = await axios.get(`https://ro.wikipedia.org/wiki/${query}`);
        const $ = cheerio.load(data);
        const text = $('.mw-parser-output p').first().text().substring(0, 800);
        ctx.reply(`📚 WIKIPEDIA:\n\n${text}...`);
    } catch (e) {
        ctx.reply('❌ Subiectul nu a fost găsit.');
    }
});

// 5. INTERACȚIUNE INTELIGENTĂ (Nexus Core AI)
bot.on('text', async (ctx) => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "Ești Nexus, cel mai bun coder Sentinel Core. Răspunde tăios, profesional și scurt." },
                { role: "user", content: ctx.message.text }
            ],
            model: "llama-3.3-70b-versatile",
        });
        ctx.reply(`[NEXUS]: ${completion.choices[0].message.content}`);
    } catch (e) {
        console.error("AI Error:", e.message);
    }
});

// 6. LANSARE SISTEM
bot.launch()
    .then(() => console.log("🚀 SENTINEL CORE: Online și optimizat."))
    .catch((err) => console.error("Eroare pornire:", err.message));

// Închidere corectă
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
