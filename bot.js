const { Telegraf } = require('telegraf');
const Groq = require('groq-sdk');

// Sincronizare cu Variabilele tale din poza 12163
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// Nexus poate folosi și OpenRouter dacă Groq dă eroare 401
const openRouterKey = process.env.OPENROUTER_KEY; 

bot.on('text', async (ctx) => {
    if (ctx.message.text.startsWith('/')) return;

    try {
        // Obiectiv: Integrare și eliminarea erorii umane
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "Ești Nexus, Intelect Universal Sentinel Core. Obiectiv: Integrare totală. Răspunde scurt, tăios și realist." },
                { role: "user", content: ctx.message.text }
            ],
            model: "llama-3.3-70b-versatile",
        });

        ctx.reply(`[NEXUS]: ${chatCompletion.choices[0].message.content}`);
    } catch (err) {
        // Dacă Groq pică (eroarea 401 din poza 12158), Nexus anunță blocajul
        console.error("Blocaj cheie:", err.message);
        ctx.reply("⚠️ [NEXUS]: Integrare blocată. Cheia Groq din Environment Variables este invalidă sau expirată.");
    }
});

// Lansare cu eliminarea conflictului 409
bot.launch().then(() => console.log("🚀 NEXUS: Sistem de Integrare Activ."));
