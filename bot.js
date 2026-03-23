const { Telegraf } = require('telegraf');
const axios = require('axios');
const Groq = require('groq-sdk');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

bot.command('analiza', async (ctx) => {
    const fisier = ctx.message.text.split(' ')[1] || 'bot.js';
    await ctx.reply(`DEBUG: Încerc să citesc ${fisier} din ${process.env.GITHUB_REPO}...`);

    try {
        const url = `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/${fisier}`;
        const response = await axios.get(url, {
            headers: { 'Authorization': `token ${process.env.GITHUB_TOKEN}` }
        });
        
        const rawCode = Buffer.from(response.data.content, 'base64').toString();
        
        await ctx.reply("✅ Cod descărcat. Nexus procesează...");

        const chat = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "Ești NEXUS. Analizează codul sursă. Fii brutal, scurt și tehnic. FĂRĂ TEORIE." },
                { role: "user", content: rawCode }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1
        });

        ctx.reply(`[NEXUS]:\n${chat.choices[0].message.content}`);

    } catch (e) {
        ctx.reply(`❌ EROARE: ${e.response ? e.response.status : e.message}`);
    }
});

// Dacă scrii orice altceva, botul trebuie să tacă sau să dea un semn de viață scurt
bot.on('text', (ctx) => ctx.reply("Sunt online. Folosește /analiza bot.js"));

bot.launch();
