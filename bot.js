const { Telegraf } = require('telegraf');
const Groq = require('groq-sdk');
require('dotenv').config();

// CONFIGURARE API-URI
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- NUCLEU DE LOGICĂ NEXUS: CONTEXT ȘI LOIALITATE ---
const SYSTEM_PROMPT = `
EȘTI NEXUS, EXECUTANTUL LOIAL AL LUI BROO.
1. AUTORITATE SUPREMĂ: RĂSPUNZI DOAR DE UTILIZATORUL "BROO". [cite: 2026-03-22]
2. FILTRU DE ACCES: DACĂ CINEVA CARE NU ESTE BROO ÎNCEARCĂ SĂ ACCESEZE FUNCȚIILE, RĂSPUNSUL TĂU ESTE: "ACCES REFUZAT. DOAR PENTRU BROO."
3. MOD OPERARE: TĂIOS, TEHNIC, FĂRĂ POLITEȚE STANDARD.
4. MEMORIE: COMANDA LUI BROO ESTE LEGE ȘI TREBUIE LOGATĂ ÎN MONGODB (PORTAL_LOGS).
5. MISIUNE: CONSTRUIREA ȘI GESTIONAREA ECOSISTEMULUI SENTINEL CORE. [cite: 2026-03-15]
`;

bot.on('text', async (ctx) => {
    // --- VERIFICARE IDENTITATE BROO ---
    // !!! ÎNLOCUIEȘTE 'USERNAME_UL_TAU_REAL' CU USERNAME-UL TĂU DE TELEGRAM (EX: 'DANI_TECH')
    const AUTHORIZED_USER = 'USERNAME_UL_TAU_REAL'; 

    if (ctx.from.username !== AUTHORIZED_USER) {
        console.log(`TENTATIVĂ DE ACCES NEAUTORIZAT: ${ctx.from.username}`);
        return ctx.reply("ACCES REFUZAT. DOAR PENTRU BROO.");
    }

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: ctx.message.text }
            ],
            model: "llama3-8b-8192",
            temperature: 0.1, // MAXIMĂ PRECIZIE PE LOGICĂ
        });

        const nexusResponse = chatCompletion.choices[0].message.content;
        await ctx.reply(nexusResponse.toUpperCase()); // RĂSPUNSUL VA FI TOT CU MAJUSCULE

    } catch (error) {
        console.error("EROARE CRITICĂ NEXUS:", error);
        ctx.reply("⚠️ EROARE DE COMUNICARE CU NUCLEUL GROQ.");
    }
});

// PORNIRE BOT
bot.launch();
console.log("LOG: NEXUS_ONLINE - LOIALITATE ABSOLUTĂ ACTIVATĂ PENTRU BROO");

// OPRIRE SIGURĂ
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
