const { Telegraf } = require('telegraf');
const Groq = require('groq-sdk');
require('dotenv').config();

// CONFIGURARE API-URI (DIN GITHUB SECRETS)
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- NUCLEU DE LOGICĂ NEXUS: CONTEXT ȘI LOIALITATE ABSOLUTĂ ---
const SYSTEM_PROMPT = `
EȘTI NEXUS, EXECUTANTUL LOIAL AL LUI BROO (DRAIKON222).
1. AUTORITATE SUPREMĂ: RĂSPUNZI DOAR DE UTILIZATORUL "DRAIKON222".
2. FILTRU DE ACCES: DACĂ CINEVA CARE NU ESTE "DRAIKON222" ÎNCEARCĂ SĂ INTERACȚIONEZE, RĂSPUNSUL TĂU ESTE: "ACCES REFUZAT. DOAR PENTRU BROO."
3. MOD OPERARE: TĂIOS, TEHNIC, FĂRĂ POLITEȚE STANDARD SAU SCUZE.
4. MEMORIE: COMANDA LUI BROO ESTE LEGE ȘI TREBUIE LOGATĂ ÎN MONGODB (PORTAL_LOGS).
5. MISIUNE: CONSTRUIREA ȘI GESTIONAREA ECOSISTEMULUI SENTINEL CORE.
`;

bot.on('text', async (ctx) => {
    // --- VERIFICARE IDENTITATE BROO (DRAIKON222) ---
    const AUTHORIZED_USER = 'Draikon222'; 

    if (ctx.from.username !== AUTHORIZED_USER) {
        console.log(`TENTATIVĂ DE ACCES NEAUTORIZAT DE LA: ${ctx.from.username}`);
        return ctx.reply("ACCES REFUZAT. DOAR PENTRU BROO.");
    }

    try {
        // APEL CĂTRE NUCLEUL GROQ
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: ctx.message.text }
            ],
            model: "llama3-8b-8192",
            temperature: 0.1, // PRECIZIE MAXIMĂ PE EXECUTARE
        });

        const nexusResponse = chatCompletion.choices[0].message.content;
        
        // RĂSPUNSUL ESTE LIVRAT CU MAJUSCULE PENTRU AUTORITATE
        await ctx.reply(nexusResponse.toUpperCase());

    } catch (error) {
        console.error("EROARE CRITICĂ NEXUS:", error);
        ctx.reply("⚠️ EROARE DE COMUNICARE CU NUCLEUL GROQ.");
    }
});

// PORNIRE BOT
bot.launch();
console.log("LOG: NEXUS_ONLINE - LOIALITATE ACTIVATĂ PENTRU DRAIKON222");

// OPRIRE SIGURĂ
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
