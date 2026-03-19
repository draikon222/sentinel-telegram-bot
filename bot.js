const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf('8561401872:AAF-s8kvSzpPCBGuybhKwkXQRwt-_bemuXI');

bot.start((ctx) => {
    ctx.replyWithMarkdown('🛡️ **SENTINEL CORE V1.0**\n[SYSTEM ONLINE]', Markup.inlineKeyboard([
        [Markup.button.callback('🚀 START SNIPER', 'start')],
        [Markup.button.callback('💰 MY WALLET', 'wallet')]
    ]));
});

bot.launch().then(() => console.log(">>> BOTUL ESTE ACTIV <<<"));
