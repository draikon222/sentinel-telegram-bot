const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.start((ctx) => ctx.reply("NEXUS RESETAT. Suntem pe varianta de diagnostic, Broo. Dă-i /analiza."));

bot.command('analiza', async (ctx) => {
    try {
        const repo = process.env.GITHUB_REPO;
        const token = process.env.GITHUB_TOKEN;
        const fisier = ctx.message.text.split(' ')[1] || 'bot.js';

        await ctx.reply(`DEBUG: Interoghez GitHub pentru ${repo}/${fisier}...`);

        const res = await axios.get(`https://api.github.com/repos/${repo}/contents/${fisier}`, {
            headers: { 'Authorization': `token ${token}` }
        });

        await ctx.reply("✅ ACCES CONFIRMAT. Nexus a citit fișierul. Acum trimit la AI...");
        // Aici am tăiat partea de AI momentan ca să vedem dacă trecem de barieră
    } catch (e) {
        ctx.reply(`❌ EROARE ACCES: ${e.response ? e.response.status : e.message}`);
    }
});

bot.on('text', (ctx) => ctx.reply("Ignor textul simplu. Folosește /analiza."));
bot.launch();
