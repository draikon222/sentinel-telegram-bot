const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const Groq = require('groq-sdk');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// ==========================================
// 🛡️ LOCAȚIE 1: SECURITATE (Imediat după 'bot')
// ==========================================
let requestCount = {};
bot.use(async (ctx, next) => {
    const now = Date.now();
    const user = ctx.from?.id;
    if (!user) return next(); 

    if (requestCount[user] && (now - requestCount[user].last) < 1000) {
        console.log(`🛡️ [SECURITY]: Spam detectat de la ${user}. Blocat.`);
        return; // Oprește execuția, nu răspunde la spam
    }
    requestCount[user] = { last: now };
    await next();
});

// ==========================================
// 💾 LOCAȚIE 2: OPTIMIZARE (În interiorul conexiunii Mongo)
// ==========================================
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("💾 [NEXUS]: Memorie conectată.");
        
        // APELĂM OPTIMIZAREA AICI
        try {
            await mongoose.connection.db.collection('NexusMemory').createIndex({ userId: 1, timestamp: -1 });
            console.log("⚡ [OPTIMIZATION]: Căi de acces date indexate.");
        } catch (e) {
            console.error("⚠️ [CRITICAL]: Unitatea de stocare refuză optimizarea.");
        }
    })
    .catch(err => console.error("❌ Eroare DB:", err.message));

// ... RESTUL CODULUI (bot.on, bot.launch, etc.)
