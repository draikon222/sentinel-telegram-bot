const { Telegraf } = require('telegraf');
const { chromium } = require('playwright');
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const Groq = require('groq-sdk');

// 1. DEFINIREA NUCLEULUI (Aceasta trebuie să fie PRIMA ca să nu mai dea ReferenceError)
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 2. CONECTARE BAZĂ DE DATE
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("💾 [NEXUS]: Memorie MongoDB conectată."))
    .catch(err => console.error("❌ Eroare DB:", err.message));

const memorySchema = new mongoose.Schema({
    userId: Number,
    role: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
});
const NexusMemory = mongoose.model('NexusMemory', memorySchema);

// 3. COMANDA: CAUTA (Google) [Ref: 12188.jpg]
bot.command('cauta', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (!query) return ctx.reply('🔹 Folosește: /cauta <termen>');
    try {
        const { data } = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        let results = [];
        $('h3').each((i, el) => { if (i < 5) results.push(`📍 ${$(el).text()}`); });
        ctx.reply(`🔍 Rezultate Google:\n\n${results.join('\n\n')}`);
    } catch (e) { ctx.reply('⚠️ Eroare la accesarea Google.'); }
});

// 4. COMANDA: SCREENSHOT (Render-Ready) [Ref: 12194.jpg]
bot.command('screenshot', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) return ctx.reply('🔹 Folosește: /screenshot <url>');
    let browser;
    try {
        ctx.reply('📸 Nexus procesează vizual...');
        browser = await chromium.launch({ 
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        const page = await browser.newPage();
        const targetUrl = url.startsWith('http') ? url : `https://${url}`;
        await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 45000 });
        const buffer = await page.screenshot();
        await ctx.replyWithPhoto({ source: buffer });
    } catch (e) { 
        ctx.reply(`❌ Eroare vizuală: Chromium nu e instalat corect pe Render.`); 
    } finally { 
        if (browser) await browser.close(); 
    }
});

// 5. COMANDA: WIKI [Ref: 12181.jpg]
bot.command('wiki', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join('_');
    try {
        const { data } = await axios.get(`https://ro.wikipedia.org/wiki/${query}`);
        const $ = cheerio.load(data);
        ctx.reply($('.mw-parser-output p').first().text().substring(0, 500));
    } catch (e) { ctx.reply('❌ Subiectul nu a fost găsit.'); }
});

// 6. INTERACȚIUNE AI + MEMORIE
bot.on('text', async (ctx) => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "Ești Nexus, cel mai bun coder Sentinel Core." },
                { role: "user", content: ctx.message.text }
            ],
            model: "llama-3.3-70b-versatile",
        });

        const reply = completion.choices[0].message.content;
        
        // Salvare în memorie
        await NexusMemory.create({ userId: ctx.from.id, role: 'user', content: ctx.message.text });
        await NexusMemory.create({ userId: ctx.from.id, role: 'nexus', content: reply });

        ctx.reply(`[NEXUS]: ${reply}`);
    } catch (e) { console.error("AI Error:", e.message); }
});

// 7. LANSARE
bot.launch().then(() => console.log("🚀 SENTINEL CORE ONLINE."));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
