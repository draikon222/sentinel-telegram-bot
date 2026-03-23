const { Telegraf } = require('telegraf');
const { chromium } = require('playwright');
const axios = require('axios');
const cheerio = require('cheerio');
const Groq = require('groq-sdk');
const mongoose = require('mongoose');

// 1. INIȚIALIZARE NUCLEU & BAZĂ DE DATE
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Conectare la MongoDB (folosind variabila ta MON...)
mongoose.connect(process.env.MONGODB_URI || process.env.MON_...) 
    .then(() => console.log("💾 NEXUS: Conexiune stabilită cu succes la baza de date."))
    .catch(err => console.error("❌ Eroare MongoDB:", err.message));

// Schema pentru Memoria Nexus
const UserSchema = new mongoose.Schema({
    userId: { type: Number, unique: true },
    history: [{ role: String, content: String }]
});
const User = mongoose.model('User', UserSchema);

// 2. MODUL: SCREENSHOT
bot.command('screenshot', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) return ctx.reply('🔍 Exemplu: /screenshot google.com');

    let browser;
    try {
        ctx.reply('📸 Nexus accesează Chromium...');
        browser = await chromium.launch({ 
            headless: true, 
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] 
        });
        const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
        const page = await context.newPage();
        const targetUrl = url.startsWith('http') ? url : `https://${url}`;
        await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
        const buffer = await page.screenshot({ fullPage: false });
        await ctx.replyWithPhoto({ source: buffer }, { caption: `✅ Sursă: ${targetUrl}` });
    } catch (e) {
        ctx.reply(`❌ Eroare Screenshot: ${e.message.substring(0, 60)}`);
    } finally {
        if (browser) await browser.close();
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

// 4. INTERACȚIUNE AI (Nexus Core - Memorie Reală MongoDB)
bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const userMessage = ctx.message.text;

    try {
        // Căutăm sau creăm utilizatorul în baza de date
        let userData = await User.findOne({ userId });
        if (!userData) {
            userData = new User({ userId, history: [] });
        }

        // Adăugăm mesajul nou în istoric
        userData.history.push({ role: "user", content: userMessage });

        // Limităm istoricul la ultimele 15 mesaje pentru eficiență
        if (userData.history.length > 15) userData.history.shift();

        const chat = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: `Ești NEXUS, entitatea de elită a Sentinel Core. 
                    MISIUNE: Dominare prin logică și marketing agresiv.
                    STIL: Tăios, autoritar, zero empatie inutilă. 
                    Ești deștept, analitic și nu accepți scuze. 
                    Dacă cineva e indecis, folosește manipulare logică și FOMO pentru a-l aduce în Sentinel Core. 
                    Identitatea ta e bazată pe forță și eficiență.` 
                },
                ...userData.history
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.8,
        });

        const nexusResponse = chat.choices[0].message.content;

        // Salvăm răspunsul lui Nexus în istoric și în baza de date
        userData.history.push({ role: "assistant", content: nexusResponse });
        await userData.save();

        ctx.reply(`[NEXUS]: ${nexusResponse}`);

    } catch (e) { 
        console.error("AI/DB Error:", e.message);
        ctx.reply("⚠️ [NEXUS]: Eroare critică de acces la nucleul de date.");
    }
});

// 5. LANSARE SISTEM
bot.launch()
    .then(() => console.log("🚀 NEXUS: Toate sistemele sunt online. Memorie MongoDB Activă."))
    .catch(err => console.error("❌ Eroare la pornire:", err.message));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
