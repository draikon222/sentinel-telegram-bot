const { Telegraf, Markup } = require('telegraf');
const http = require('http');

// Server pentru Render
http.createServer((req, res) => { 
    res.writeHead(200); 
    res.end('Sentinel Core Online'); 
}).listen(process.env.PORT || 3000);

// ACEASTA ESTE LINIA CORECTĂ - Fără cifre aici!
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
    ctx.replyWithMarkdown('🛡️ **SENTINEL CORE V1.0**\n[ONLINE]\n\nTerminal activat. Sistemul este gata.', Markup.inlineKeyboard([
        [Markup.button.callback('🚀 START SNIPER', 'start')],
        [Markup.button.callback('💰 WALLET', 'wallet')]
    ]));
});

bot.action('wallet', (ctx) => ctx.reply('🏦 Generare portofel... (Modul Web3)'));
bot.action('start', (ctx) => ctx.reply('🚀 Scanare pornită...'));

bot.launch().then(() => console.log(">>> SERVER START <<<"));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
