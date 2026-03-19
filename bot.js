const { Telegraf, Markup } = require('telegraf');
const http = require('http');

http.createServer((req, res) => { res.writeHead(200); res.end('Sentinel Active'); }).listen(process.env.PORT || 3000);

// Linia asta e sfântă. Nu pune cifre aici.
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
    ctx.replyWithMarkdown('🛡️ **SENTINEL CORE V1.0**\n[ONLINE]', Markup.inlineKeyboard([
        [Markup.button.callback('🚀 START SNIPER', 'start')],
        [Markup.button.callback('💰 WALLET', 'wallet')]
    ]));
});

bot.launch().then(() => console.log(">>> SERVER START <<<"));
