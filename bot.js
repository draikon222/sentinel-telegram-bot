const { Telegraf, Markup } = require('telegraf');

// TOKEN PUS DIRECT (Fara spatii, fara erori)
const bot = new Telegraf('8561401872:AAF-s8kvSzpPCBGuybhKwkXQRwt-_bemuXI');

bot.start((ctx) => {
    ctx.replyWithMarkdown('🛡️ **SENTINEL CORE V1.0**\n[ONLINE]', Markup.inlineKeyboard([
        [Markup.button.callback('🚀 START SNIPER', 'start')],
        [Markup.button.callback('💰 WALLET', 'wallet')]
    ]));
});

// Pornire cu log de confirmare
bot.launch()
  .then(() => console.log(">>> BOTUL ESTE PORNIT SI FUNCTIONAL! <<<"))
  .catch((err) => console.log("EROARE START:", err.message));

// Evitam inchiderea botului
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
