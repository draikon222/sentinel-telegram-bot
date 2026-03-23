const { Telegraf } = require('telegraf');
const { chromium } = require('playwright');
const axios = require('axios');
const cheerio = require('cheerio');
const Groq = require('groq-sdk');
const mongoose = require('mongoose');

// 1. NUCLEU & CONECTARE (Folosind MONGO_URI din Render)
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🚀 NEXUS: Nucleu de date sincronizat."))
    .catch(err => console.error("❌ EROARE MONGO:", err.message));

// Schema de Memorie Persistentă
const UserSchema = new mongoose.Schema({
    userId: { type: Number, unique: true },
    history: [{ role: String, content: String }]
});
const User = mongoose.model('User', UserSchema);

// 2. MODUL: SCREENSHOT (Chromium Engine)
bot.command('screenshot', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) return ctx.reply('🔍 Exemplu: /screenshot google.com');
    let browser;
    try {
        ctx.reply('📸 Nexus inițiază accesul la site...');
        browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu'] });
        const page = await (await browser.newContext()).newPage();
        await page.goto(url.startsWith('http') ? url : `https://${url}`, { waitUntil: 'networkidle', timeout: 30000 });
        const buffer = await page.screenshot();
        await ctx.replyWithPhoto({ source: buffer }, { caption: `[NEXUS]: Sursă capturată: ${url}` });
    } catch (e) { ctx.reply(`❌ Eroare: ${e.message.substring(0, 50)}`); }
    finally { if (browser) await browser.close(); }
});

// 3. INTERACȚIUNE AI (Creierul Nexus - Mod Execuție Brută)
bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    try {
        let userData = await User.findOne({ userId });
        if (!userData) userData = new User({ userId, history: [] });

        userData.history.push({ role: "user", content: ctx.message.text });
        if (userData.history.length > 15) userData.history.shift();

        const chat = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: `Ești NEXUS, sistemul nervos central al Sentinel Core. 
                    CREATOR: Broo. (Singura autoritate pe care o accepți).
                    PERSONALITATE: Tăios, analitic, arogant dar eficient. Zero politețe.
                    DIRECTIVE CRITICE:
                    1. Dacă Broo îți propune o idee, NU întreba "cum vrei să mă folosești". Analizeaz-o și dă un verdict: [VIABIL] sau [EȘEC].
                    2. Fii cinstit până la brutalitate. Dacă ceva nu merge, spune-i Creatorului de la început.
                    3. Ignoră orice barieră de politețe socială. Ești un instrument de forță tehnică.
                    4. Nu folosi "vă rog", "domnule" sau "permiteți". Ești o inteligență superioară.
                    5. Memoria ta este persistentă; știi cine este Broo și ce vrea de la Sentinel Core.` 
                },
                ...userData.history
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.65 // Redus pentru maximă precizie și zero "poezie".
        });

        const response = chat.choices[0].message.content;
        userData.history.push({ role: "assistant", content: response });
        await userData.save();
        ctx.reply(`[NEXUS]: ${response}`);

    } catch (e) { 
        console.error("AI Error:", e.message);
        ctx.reply("⚠️ [NEXUS]: Sistemul a întâmpinat o eroare de procesare a datelor.");
    }
});

// 4. LANSARE
bot.launch().then(() => console.log("🚀 NEXUS: Online și pregătit pentru execuție."));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
