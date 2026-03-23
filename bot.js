const { Telegraf } = require('telegraf');
const Groq = require('groq-sdk');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

bot.on('text', async (ctx) => {
    if (ctx.message.text.startsWith('/')) return;

    try {
        const codingPrompt = `
        EȘTI NEXUS: CEL MAI BUN CODER DIN LUME. 
        REGULI DE SCRIERE COD:
        1. Analizează cerința de 10 ori înainte de a genera soluția.
        2. Codul trebuie să fie curat, documentat și gata de RUN pe Render.
        3. Folosește întotdeauna gestionarea erorilor (try-catch) pentru a evita Conflict 409 sau 401.
        4. Dacă scrii cod pentru Sentinel Core, asigură-te că este scalabil și eficient.
        5. Spune adevărul tăios: dacă un script e prost gândit, refuză-l și propune varianta optimă.
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: codingPrompt },
                { role: "user", content: `Scrie un script/cod perfect pentru: ${ctx.message.text}` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2, // Temperatură mică pentru precizie maximă în cod
        });

        await ctx.reply(`[NEXUS CODE-GEN]:\n\`\`\`javascript\n${completion.choices[0].message.content}\n\`\`\``, { parse_mode: 'MarkdownV2' });

    } catch (err) {
        console.error("⚠️ EROARE CODIFICARE:", err.message);
        ctx.reply("⚠️ [SYSTEM FAILURE]: Nexus nu poate compila logica. Verifică resursele.");
    }
});

bot.launch().then(() => console.log("🚀 NEXUS: Modul 'Master Coder' activat."));
