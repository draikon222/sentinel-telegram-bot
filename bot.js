const { Telegraf } = require('telegraf');
const { chromium } = require('playwright');
const axios = require('axios');
const cheerio = require('cheerio');
const Groq = require('groq-sdk');
const mongoose = require('mongoose');

// 1. NUCLEU & CONFIGURARE (Folosește variabilele tale din Render)
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

// 2. MODUL GITHUB: Citirea codului tău (Folosește GITHUB_TOKEN și GITHUB_REPO)
async function citesteCodGitHub(path) {
    try {
        const url = `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/${path}`;
        const { data } = await axios.get(url, {
            headers: { 'Authorization': `token ${process.env.GITHUB_TOKEN}` }
        });
        return Buffer.from(data.content, 'base64').toString();
    } catch (e) { 
        return `Eroare: Nu pot accesa ${path}. Verifică GITHUB_TOKEN și GITHUB_REPO în Render.`; 
    }
}

// 3. COMANDA DE ANALIZĂ BRUTALĂ (Fără teorie, doar tehnic)
bot.command('analiza', async (ctx) => {
    const fisier = ctx.message.text.split(' ')[1];
    if (!fisier) return ctx.reply('🔍 Zi-mi ce fișier vrei să spargem (ex: /analiza bot.js)');

    await ctx.reply(`📡 Nexus scanează GitHub pentru ${fisier}...`);
    const codSursa = await citesteCodGitHub(fisier);

    if (codSursa.startsWith("Eroare")) return ctx.reply(`❌ ${codSursa}`);

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: `Ești NEXUS Senior Architect. 
                    REGULI ABSOLUTE: 
                    1. NU oferi definiții generale despre ce este un bot sau ce este JavaScript. 
                    2. Sari direct la analiza codului primit. 
                    3. Identifică: Liniile cu erori, Vulnerabilități de securitate, Lipsa gestionării erorilor. 
                    4. Stil: Tăios, critic, fără politețe. 
                    5. Verdict obligatoriu: [VIABIL] sau [EȘEC].` 
                },
                { role: "user", content: `Analizează STRICT acest cod din ${fisier}:\n\n${codSursa}` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3 // Scăzut pentru precizie maximă, fără "poezie"
        });
        ctx.reply(`[ANALIZĂ TEHNICĂ NEXUS]:\n\n${completion.choices[0].message.content}`);
    } catch (e) { ctx.reply("⚠️ [NEXUS]: Eroare critică la procesarea AI."); }
});

// 4. INTERACȚIUNE CENTRALĂ (Broo Mode)
bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    try {
        let userData = await User.findOne({ userId });
        if (!userData) userData = new User({ userId, history: [] });

        userData.history.push({ role: "user", content: ctx.message.text });
        if (userData.history.length > 10) userData.history.shift();

        const chat = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "Ești NEXUS, sistemul creat de Broo. Ești tăios, onest și analizezi dacă o idee are succes sau nu. Dacă ideea e proastă, oprește-l pe Broo imediat." 
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
    } catch (e) { console.error(e); }
});

// LANSARE
bot.launch().then(() => console.log("🚀 NEXUS: Sistemul a fost resetat și este gata de execuție."));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
