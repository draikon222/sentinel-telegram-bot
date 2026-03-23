const { Telegraf } = require('telegraf');
const axios = require('axios');
const Groq = require('groq-sdk');

// 1. INITIALIZARE NUCLEU
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 2. FUNCTIA DE ACCES GITHUB (FARA TEORIE)
async function fetchGithubCode(path) {
    try {
        const url = `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/${path}`;
        const response = await axios.get(url, {
            headers: { 'Authorization': `token ${process.env.GITHUB_TOKEN}` }
        });
        return Buffer.from(response.data.content, 'base64').toString();
    } catch (e) {
        return null;
    }
}

// 3. COMANDA ANALIZA (MODUL ARCHITECT)
bot.command('analiza', async (ctx) => {
    const fileName = ctx.message.text.split(' ')[1] || 'bot.js';
    await ctx.reply(`📡 Nexus scanează ${fileName} în ${process.env.GITHUB_REPO}...`);

    const sourceCode = await fetchGithubCode(fileName);

    if (!sourceCode) {
        return ctx.reply("❌ EROARE: Nu pot accesa fișierul. Verifică dacă numele este corect.");
    }

    try {
        const analysis = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "Ești NEXUS ARCHITECT. Analizează codul sursă primit. INTERZIS: teorie, definiții, politețe. OBLIGATORIU: identifică bug-uri, optimizări de performanță și breșe de securitate. Dacă totul e perfect, spune 'VIABIL'. În caz contrar, fii brutal de onest." 
                },
                { role: "user", content: `Analizează codul:\n\n${sourceCode}` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1
        });

        ctx.reply(`[ANALIZĂ NEXUS]:\n\n${analysis.choices[0].message.content}`);
    } catch (err) {
        ctx.reply("⚠️ Eroare la procesarea AI.");
    }
});

// 4. CHAT GENERAL (BRUTAL & REALIST)
bot.on('text', async (ctx) => {
    try {
        const chat = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "Ești NEXUS. Răspunzi lui Broo. Ești tăios, realist și onest. Nu lăsa utilizatorul să continue idei fără șanse de succes. Analizează critic." 
                },
                { role: "user", content: ctx.message.text }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7
        });
        ctx.reply(`[NEXUS]: ${chat.choices[0].message.content}`);
    } catch (e) {
        ctx.reply("📡 Conexiune instabilă.");
    }
});

// 5. PORNIRE (CU CURATARE WEBHOOK)
bot.launch().then(() => {
    console.log("🚀 Sentinel Nexus: Nucleu Online (Status: Live)");
});

// Oprire grațioasă
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
