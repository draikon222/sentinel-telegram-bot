const { Telegraf } = require('telegraf');
const { chromium } = require('playwright');
const axios = require('axios');
const cheerio = require('cheerio');
const Groq = require('groq-sdk');
const mongoose = require('mongoose');

// 1. INIȚIALIZARE NUCLEU
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Conectare MongoDB Atlas (Persistentă)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🚀 NEXUS: Nucleu de date sincronizat."))
    .catch(err => console.error("❌ EROARE MONGO:", err.message));

const UserSchema = new mongoose.Schema({
    userId: { type: Number, unique: true },
    history: [{ role: String, content: String }]
});
const User = mongoose.model('User', UserSchema);

// 2. MODUL: SEARCH WEB (Analiză Date Reale)
async function cautaPeWeb(query) {
    try {
        const { data } = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        let results = [];
        $('h3').slice(0, 3).each((i, el) => results.push($(el).text()));
        return results.join(', ');
    } catch (e) { return "Căutare indisponibilă."; }
}

// 3. MODUL: SCREENSHOT (Execuție Vizuală)
bot.command('screenshot', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) return ctx.reply('🔍 Exemplu: /screenshot google.com');
    let browser;
    try {
        ctx.reply('📸 Nexus accesează site-ul...');
        browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu'] });
        const page = await (await browser.newContext()).newPage();
        await page.goto(url.startsWith('http') ? url : `https://${url}`, { waitUntil: 'networkidle', timeout: 30000 });
        const buffer = await page.screenshot();
        await ctx.replyWithPhoto({ source: buffer });
    } catch (e) { ctx.reply(`❌ Eroare: ${e.message.substring(0, 50)}`); }
    finally { if (browser) await browser.close(); }
});

// 4. INTERACȚIUNE AI (Creierul Nexus cu Search Web Integrat)
bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const input = ctx.message.text;

    try {
        let userData = await User.findOne({ userId });
        if (!userData) userData = new User({ userId, history: [] });

        // Nexus face o mini-căutare dacă detectează o propunere sau întrebare nouă
        const contextWeb = await cautaPeWeb(input);

        userData.history.push({ role: "user", content: input });
        if (userData.history.length > 10) userData.history.shift();

        const chat = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: `Ești NEXUS, sistemul central al Sentinel Core creat de Broo.
                    MISIUNE: Analiză critică brutală și execuție.
                    STIL: Tăios, arogant, hiper-inteligent. Zero politețe.
                    CONTEXT WEB ACTUAL: ${contextWeb}
                    REGULI:
                    1. Dacă Broo propune ceva, folosește Contextul Web pentru a-i da un verdict: [VIABIL] sau [EȘEC].
                    2. Nu întreba "ce vrei să fac". Spune-i tu lui Broo ce TREBUIE făcut pe baza datelor.
                    3. Dacă o idee e proastă, desființeaz-o cu argumente tehnice. 
                    4. Nu folosi formule de salut sau politețe inutile. Treci la subiect.` 
                },
                ...userData.history
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.6
        });

        const response = chat.choices[0].message.content;
        userData.history.push({ role: "assistant", content: response });
        await userData.save();
        ctx.reply(`[NEXUS]: ${response}`);

    } catch (e) { 
        console.error("AI Error:", e.message);
        ctx.reply("⚠️ [NEXUS]: Eroare critică de procesare.");
    }
});

// 5. LANSARE
bot.launch().then(() => console.log("🚀 NEXUS: Sistem complet online cu Search Web integrat."));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
