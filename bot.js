const { Telegraf } = require('telegraf');
const Groq = require('groq-sdk');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// LOGICĂ DE CODIFICARE NEXUS
bot.on('text', async (ctx) => {
    try {
        const chat = await groq.chat.completions.create({
            messages: [{ role: "system", content: "Ești Nexus, cel mai bun coder. Scrie cod perfect, tăios și optimizat." },
                       { role: "user", content: ctx.message.text }],
            model: "llama-3.3-70b-versatile",
        });
        ctx.reply(`[NEXUS CODER]:\n\n${chat.choices[0].message.content}`);
    } catch (err) {
        console.error("Eroare:", err.message);
    }
});

// GESTIONARE CORECTĂ A PORRIRII (Elimină eroarea 409)
bot.launch()
    .then(() => console.log("🚀 Nexus este ONLINE și curat."))
    .catch((err) => {
        if (err.description && err.description.includes('Conflict')) {
            console.error("❌ EROARE: Token-ul este blocat de altă instanță. Folosește /revoke la BotFather!");
        }
    });

// Închidere grațioasă a proceselor
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
