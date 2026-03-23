const { Telegraf } = require('telegraf');
const axios = require('axios');
const Groq = require('groq-sdk');
const mongoose = require('mongoose');

// 1. CONFIGURARE NUCLEU
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🚀 NEXUS: Nucleu sincronizat."))
    .catch(err => console.error("❌ EROARE MONGO:", err.message));

const UserSchema = new mongoose.Schema({
    userId: { type: Number, unique: true },
    history: [{ role: String, content: String }]
});
const User = mongoose.model('User', UserSchema);

// 2. MODUL GITHUB (Sursă Brută)
async function citesteCodGitHub(path) {
    try {
        const url = `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/${path}`;
        const { data } = await axios.get(url, {
            headers: { 'Authorization': `token ${process.env.GITHUB_TOKEN}` }
        });
        return Buffer.from(data.content, 'base64').toString();
    } catch (e) { 
        return null; 
    }
}

// 3. COMANDA /ANALIZA (Zero Teorie, Doar Execuție)
bot.command('analiza', async (ctx) => {
    const fisier = ctx.message.text.split(' ')[1] || 'bot.js';
    
    await ctx.reply(`📡 Nexus scanează ${fisier}...`);
    const codSursa = await citesteCodGitHub(fisier);

    if (!codSursa) {
        return ctx.reply("❌ EROARE: Nu pot citi fișierul. Verifică GITHUB_TOKEN și GITHUB_REPO în Render.");
    }

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: `Ești NEXUS, creat de Broo. 
                    DIRECTIVĂ: Analizează codul sursă primit. 
                    INTERZIS: Nu da definiții generale, nu vorbi despre "ce este un bot", nu folosi bullet points pentru teorie. 
                    OBLIGATORIU: Identifică linii de cod specifice, bug-uri, paranteze lipsă sau variabile nedeclarate. 
                    STIL: Brutal, tăios, tehnic. 
                    VERDICT: Începe cu [VIABIL] sau [EȘEC].` 
                },
                { role: "user", content: `Analizează STRICT acest cod:\n\n${codSursa}` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1 // Înghețăm creativitatea pentru a forța analiza tehnică
        });
        ctx.reply(`[ANALIZĂ TEHNICĂ NEXUS]:\n\n${completion.choices[0].message.content}`);
    } catch (e) { ctx.reply("⚠️ Eroare AI."); }
});

// 4. CREIERUL NEXUS (Dialog)
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
                    content: "Ești NEXUS. Răspunzi doar lui Broo. Ești tăios și realist. Dacă o idee e proastă, o desființezi." 
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

bot.launch();
