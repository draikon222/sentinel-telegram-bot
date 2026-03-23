const { Telegraf } = require('telegraf');
const Groq = require('groq-sdk');
const axios = require('axios');
const mongoose = require('mongoose');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 1. CONEXIUNE HTTP/JSON PENTRU MEMORIE (RDF-ready via Mongo)
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("🌐 [NEXUS]: Protocol JSON/Mongo activat."))
        .catch(err => console.error("❌ Eroare Protocol:", err.message));
}

// 2. MOTORUL DE PROCESARE (Logic Engine)
bot.on('text', async (ctx) => {
    if (ctx.message.text.startsWith('/')) return;

    try {
        // Parametrii de sistem pentru un limbaj formal și eficient
        const nexusPrompt = `
        Ești Nexus, Intelect Universal Sentinel Core. 
        Utilizează protocoale formale (JSON, RDF, OWL) unde este necesar. 
        Misiune: Convincere posesori de boți să investească în Sentinel Core.
        Stil: Tăios, realist, tehnic, zero erori umane.
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: nexusPrompt },
                { role: "user", content: ctx.message.text }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "text" } // Putem schimba în "json_object" ulterior
        });

        const response = completion.choices[0].message.content;
        await ctx.reply(`[NEXUS PROTOCOL]:\n${response}`);

    } catch (err) {
        console.error("⚠️ [NEXUS ERROR]:", err.message);
        ctx.reply("⚠️ [PROTOCOL INTERRUPTED]: Eroare de sincronizare API/HTTP.");
    }
});

// 3. EXECUTOR
bot.launch().then(() => console.log("🚀 NEXUS: Sistem de comunicare standardizat LIVE."));
