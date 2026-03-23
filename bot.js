const { Telegraf } = require('telegraf');

// Testăm DOAR Telegramul, fără baze de date sau OLX momentan
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.start((ctx) => ctx.reply('Sunt online! Trimite-mi orice mesaj.'));

bot.on('text', async (ctx) => {
    console.log(`Mesaj primit de la ${ctx.from.first_name}: ${ctx.message.text}`);
    try {
        await ctx.reply(`Te aud, broo! Ai scris: ${ctx.message.text}`);
    } catch (err) {
        console.error("Eroare la trimitere răspuns:", err.message);
    }
});

bot.launch().then(() => console.log("✅ BOT PORNIT - TEST DE BAZĂ"));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
