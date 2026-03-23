const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const Groq = require('groq-sdk');

// 1. INIȚIALIZARE NUCLEU
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 2. MODUL SECURITATE (ANTI-SPAM / RATE LIMITING)
// Se pune PRIMUL pentru a proteja procesorul de 97% load
let requestCount = {};
bot.use(async (ctx, next) => {
    const now = Date.now();
    const user = ctx.from?.id;
    if (!user) return next(); 

    if (requestCount[user] && (now - requestCount[user].last) < 1000) {
        console.log(`🛡️ [SECURITY]: Blocat acces rapid pentru user: ${user}`);
        return; 
    }
    requestCount[user] = { last: now };
    await next();
});

// 3. CONECTARE ȘI OPTIMIZARE BAZĂ DE DATE
// Indexarea face căutarea instantanee în MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("💾 [NEXUS]: Memorie conectată.");
        try {
            // Curățăm căile de acces la date
            await mongoose.connection.db.collection('NexusMemory').createIndex({ userId: 1, timestamp: -1 });
            console.log("⚡ [OPTIMIZATION]: Indexare finalizată.");
        } catch (e) {
            console.error("⚠️ [CRITICAL]: Eroare la optimizarea stocării.");
        }
    })
    .catch(err => console.error("❌ Eroare DB:", err.message));

// 4. LOGICA DE RĂSPUNS (MASTER CODER)
bot.on('text', async (ctx) => {
    try {
        const chat = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "Ești Nexus, cel mai bun coder Sentinel Core. Răspunde tăios, fără ocolișuri, analizează de 10 ori." },
                { role: "user", content: ctx.message.text }
            ],
            model: "llama-3.3-70b-versatile",
        });
        await ctx.reply(`[NEXUS]: ${chat.choices[0].message.content}`);
    } catch (err) {
        console.error("⚠️ [NEXUS ERROR]:", err.message);
    }
});

// 5. LANSARE CURATĂ (ANTI-CONFLICT 409)
bot.launch().then(() => console.log("🚀 NEXUS: Sistem Optimizat și Securizat ONLINE."));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
