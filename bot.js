const { Telegraf, Markup } = require('telegraf');
const http = require('http');

// Creăm un server minim ca să nu mai dea Render eroare de Port
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Sentinel Sniper is Active');
});
server.listen(process.env.PORT || 3000);

const bot = new Telegraf('8561401872:AAF-s8kvSzpPCBGuybhKwkXQRwt-_bemuXI');

bot.start((ctx) => {
    ctx.replyWithMarkdown('🛡️ **SENTINEL CORE V1.0**\n[SYSTEM ONLINE]', Markup.inlineKeyboard([
        [Markup.button.callback('🚀 START SNIPER', 'start')],
        [Markup.button.callback('💰 MY WALLET', 'wallet')]
    ]));
});

bot.launch().then(() => console.log(">>> BOTUL ESTE ACTIV <<<"));

// Oprire curata
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
