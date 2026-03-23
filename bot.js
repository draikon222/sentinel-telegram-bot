const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.on('text', async (ctx) => {
    // Dacă primește /analiza, încercăm DOAR citirea brută. 
    // Dacă eșuează, dăm eroarea în față, nu poezii.
    if (ctx.message.text.includes('/analiza')) {
        try {
            const url = `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/bot.js`;
            const res = await axios.get(url, {
                headers: { 'Authorization': `token ${process.env.GITHUB_TOKEN}` }
            });
            const content = Buffer.from(res.data.content, 'base64').toString();
            return ctx.reply("COD CITIT CU SUCCES. ALPHA TEST TRECUT.");
        } catch (e) {
            return ctx.reply(`EȘEC TOTAL ACCES: ${e.message}. Verifica GITHUB_REPO.`);
        }
    }
    ctx.reply("Sunt online, dar nu fac nimic până nu merge /analiza.");
});

bot.launch();
