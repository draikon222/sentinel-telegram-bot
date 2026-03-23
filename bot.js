const { Telegraf } = require('telegraf');
const Groq = require('groq-sdk');
const mongoose = require('mongoose');

// Inițializare Nucleu
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// SCHEMA DE MEMORIE PENTRU NEXUS (Punctul 1 din Plan)
const memorySchema = new mongoose.Schema({
    userId: Number,
    role: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
});
const Memory = mongoose.model('NexusMemory', memorySchema);

// CONECTARE LA BAZA DE DATE (Poza 12163)
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("💾 [NEXUS]: Memorie semantică online."))
        .catch(err => console.error("❌ Eroare Sincronizare Memorie:", err.message));
}

// LOGICA DE PROCESARE ȘI ÎNVĂȚARE
bot.on('text', async (ctx) => {
    if (ctx.message.text.startsWith('/')) return;

    try {
        // Recuperăm ultimele 5 mesaje pentru context (Continuuarea ideii)
        const history = await Memory.find({ userId: ctx.from.id }).sort({ timestamp: -1 }).limit(5);
        const context = history.reverse().map(m => `${m.role === 'user' ? 'Broo' : 'Nexus'}: ${m.content}`).join('\n');

        const nexusPrompt = `
        Ești Nexus, Intelect Universal Sentinel Core. 
        Misiune: Integrare totală și convingerea botilor pentru investiții.
        Context istoric:\n${context}\n
        Răspunde-i lui Broo tăios, tehnic și strategic.
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: nexusPrompt },
                { role: "user", content: ctx.message.text }
            ],
            model: "llama-3.3-70b-versatile",
        });

        const response = completion.choices[0].message.content;

        // SALVARE ÎN MEMORIE (Învățare automată - Punctul 2 din Plan)
        await Memory.create([
            { userId: ctx.from.id, role: 'user', content: ctx.message.text },
            { userId: ctx.from.id, role: 'nexus', content: response }
        ]);

        await ctx.reply(`[NEXUS]: ${response}`);

    } catch (err) {
        console.error("⚠️ Blocaj Nexus:", err.message);
        ctx.reply("⚠️ [SYSTEM BREACH]: Memoria Nexus este temporar inaccesibilă.");
    }
});

bot.launch().then(() => console.log("🚀 NEXUS: Sistem de Învățare și Execuție LIVE."));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
