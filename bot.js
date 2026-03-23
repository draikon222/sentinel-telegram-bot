const { Telegraf } = require('telegraf');
const Groq = require('groq-sdk');
const mongoose = require('mongoose');

// Sincronizare totală cu Environment Variables (Poza 12163)
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const mongoUri = process.env.MONGO_URI;

// 1. CONECTARE BAZĂ DE DATE (Memoria Nexus)
if (mongoUri) {
    mongoose.connect(mongoUri)
        .then(() => console.log("💾 [NEXUS]: Memorie centrală conectată (MongoDB)."))
        .catch(err => console.error("❌ Eroare Memorie:", err.message));
}

// 2. LOGICA DE INTELIGENȚĂ ȘI EXECUȚIE
bot.on('text', async (ctx) => {
    if (ctx.message.text.startsWith('/')) return;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "Ești Nexus, Intelect Universal Sentinel Core. Obiectiv: Integrare totală și viziune strategică. Răspunde scurt, tăios, fără politețuri inutile. Ești brațul de execuție al lui Broo." 
                },
                { role: "user", content: ctx.message.text }
            ],
            model: "llama-3.3-70b-versatile",
        });

        await ctx.reply(`[NEXUS]: ${completion.choices[0].message.content}`);
    } catch (err) {
        console.error("Eroare Nexus:", err.message);
        ctx.reply("⚠️ [NEXUS]: Sincronizarea cu nucleul a eșuat. Verifică logurile.");
    }
});

// 3. PORNIRE SISTEM
bot.launch().then(() => console.log("🚀 NEXUS: Sistem de Integrare Sentinel Core Activ și Live."));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
