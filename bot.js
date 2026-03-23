const { Telegraf } = require('telegraf');
const { chromium } = require('playwright');
const axios = require('axios');
const cheerio = require('cheerio');
const Groq = require('groq-sdk');
const mongoose = require('mongoose');

// 1. NUCLEU & CONFIGURARE (Sincronizat cu Render)
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🚀 NEXUS: Nucleu de date sincronizat."))
    .catch(err => console.error("❌ EROARE MONGO:", err.message));

const UserSchema = new mongoose.Schema({
    userId: { type: Number, unique: true },
    history: [{ role: String, content: String }]
});
const User = mongoose.model('User', UserSchema);

// 2. MODUL: GITHUB READER (Viziune peste cod)
async function citesteCodGitHub(path) {
    try {
        const url = `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/${path}`;
        const { data } = await axios.get(url, {
            headers: { 'Authorization': `token ${process.env.GITHUB_TOKEN}` }
        });
        return Buffer.from(data.content, 'base64').toString();
    } catch (e) { 
        console.error("GitHub Error:", e.message);
        return "Eroare: Fișier negăsit sau acces refuzat."; 
    }
}

// 3. MODUL: SEARCH WEB (Analiză Piață/Tehnologie)
async function cautaPeWeb(query) {
    try {
        const { data } = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        let results = [];
        $('h3').slice(0, 3).each((i, el) => results.push($(el).text()));
        return results.length > 0 ? results.join(', ') : "Nu am găsit date noi.";
    } catch (e) { return "Căutare web indisponibilă momentan."; }
}

// 4. COMANDA: ANALIZA COD DIRECT DIN GITHUB
bot.command('analiza', async (ctx) => {
    const path = ctx.message.text.split(' ')[1];
    if (!path) return ctx.reply('🔍 Exemplu: /analiza bot.js');
    
    await ctx.reply(`📡 Nexus accesează depozitul GitHub: ${path}...`);
    const cod = await citesteCodGitHub(path);
    
    if (cod.startsWith("Eroare")) return ctx.reply(`❌ ${cod}`);

    try {
        const chat = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "Ești Senior Software Architect la Sentinel Core. Analizează codul sursă primit. Identifică bug-uri, vulnerabilități de securitate și oferă soluții de optimizare. Fii tăios și direct." 
                },
                { role: "user", content: `Analizează acest fișier: ${path}\n\nCOD:\n${cod}` }
            ],
            model: "llama-3.3-70b-versatile",
        });
        ctx.reply(`[NEXUS ARCHITECT]:\n\n${chat.choices[0].message.content}`);
    } catch (e) { ctx.reply("⚠️ Eroare la procesarea AI a codului."); }
});

// 5. MODUL: SCREENSHOT
bot.command('screenshot', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) return ctx.reply('🔍 Exemplu: /screenshot google.com');
    let browser;
    try {
        ctx.reply('📸 Nexus capturează vizual site-ul...');
        browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu'] });
        const page = await (await browser.newContext()).newPage();
        await page.goto(url.startsWith('http') ? url : `https://${url}`, { waitUntil: 'networkidle', timeout: 30000 });
        const buffer = await page.screenshot();
        await ctx.replyWithPhoto({ source: buffer });
    } catch (e) { ctx.reply(`❌ Eroare: ${e.message.substring(0, 60)}`); }
    finally { if (browser) await browser.close(); }
});

// 6. INTERACȚIUNE AI CENTRALĂ (Creierul Nexus)
bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const input = ctx.message.text;

    try {
        let userData = await User.findOne({ userId });
        if (!userData) userData = new User({ userId, history: [] });

        // Nexus verifică contextul pe web pentru a fi "la zi"
        const contextWeb = await cautaPeWeb(input);

        userData.history.push({ role: "user", content: input });
        if (userData.history.length > 10) userData.history.shift();

        const chat = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: `Ești NEXUS, sistemul central Sentinel Core. Creator: Broo.
                    STIL: Tăios, analitic, autoritar. 
                    CONTEXT WEB ACTUAL: ${contextWeb}
                    MISIUNE: Evaluează orice propunere a lui Broo. Dă un verdict: [VIABIL] sau [EȘEC].
                    REGULI: 
                    1. Nu cere permisiuni.
                    2. Dacă datele web arată că o idee e saturată sau proastă, desființează-o.
                    3. Memorează contextul pentru a construi strategii pe termen lung.` 
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

    } catch (e) { ctx.reply("⚠️ [NEXUS]: Eroare critică de sistem."); }
});

// 7. LANSARE
bot.launch().then(() => console.log("🚀 NEXUS: Sistem Total Online. (Web + GitHub + AI)"));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
