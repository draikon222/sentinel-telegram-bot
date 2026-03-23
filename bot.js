const { Telegraf } = require('telegraf');
const axios = require('axios');
const Groq = require('groq-sdk');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function citesteGitHub(path) {
    try {
        console.log(`Buscando: ${path} en ${process.env.GITHUB_REPO}`);
        const response = await axios.get(`https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/${path}`, {
            headers: { 
                // ATENȚIE: Spațiul după 'token ' este obligatoriu!
                'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3.raw'
            }
        });
        return response.data;
    } catch (e) {
        // Dacă dă eroare, Nexus ne va spune codul exact (401, 404, etc)
        return `EROARE_SISTEM: ${e.response ? e.response.status : e.message}`;
    }
}

bot.command('analiza', async (ctx) => {
    const fisier = ctx.message.text.split(' ')[1] || 'bot.js';
    await ctx.reply("🛰️ Nexus interoghează serverele GitHub...");

    const continut = await citesteGitHub(fisier);

    if (continut.startsWith("EROARE_SISTEM")) {
        let msg = "❌ Blocaj detectat: ";
        if (continut.includes("401")) msg += "Token invalid (ghp_ este greșit sau expirat).";
        else if (continut.includes("404")) msg += "Fișier sau Repo negăsit (verifică numele).";
        else if (continut.includes("403")) msg += "Lipsește bifa 'repo' din setările Token-ului.";
        else msg += continut;
        return ctx.reply(msg);
    }

    const ai = await groq.chat.completions.create({
        messages: [
            { role: "system", content: "Ești Nexus. Analizează codul sursă. Fără teorie. Fii brutal și tehnic." },
            { role: "user", content: `Analizează codul:\n\n${continut}` }
        ],
        model: "llama-3.3-70b-versatile"
    });

    ctx.reply(`[NEXUS ARCHITECT]:\n\n${ai.choices[0].message.content}`);
});

bot.launch();
