const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.start((ctx) => ctx.reply("NEXUS RESETAT. Suntem pe varianta de diagnostic. Dă-i /analiza."));

bot.command('analiza', async (ctx) => {
    try {
        const repo = process.env.GITHUB_REPO;
        const token = process.env.GITHUB_TOKEN;
        const fisier = ctx.message.text.split(' ')[1] || 'bot.js';

        await ctx.reply(`🔍 Verific accesul pentru: ${repo}/${fisier}...`);

        const res = await axios.get(`https://api.github.com/repos/${repo}/contents/${fisier}`, {
            headers: { 'Authorization': `token ${token}` }
        });

        if (res.data.content) {
            await ctx.reply("✅ SUCCES: Nexus a citit fișierul de pe GitHub!");
        }
    } catch (e) {
        // Dacă dă eroare, ne va zice exact codul (401, 404, 403)
        ctx.reply(`❌ EROARE ACCES: ${e.response ? e.response.status : e.message}`);
    }
});

bot.on('text', (ctx) => ctx.reply("Ignor textul simplu. Folosește comanda /analiza bot.js."));

bot.launch();
