const { Telegraf, Markup } = require('telegraf');
const http = require('http');

// Creăm un mini-server ca Render să vadă că botul e "viu"
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Sentinel Sniper Bot is Online');
});
server.listen(process.env.PORT || 3000);

// CONFIGURARE BOT - Ia token-ul automat din setările Render
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
    ctx.replyWithMarkdown('🛡️ **SENTINEL CORE V1.0**\n[SYSTEM ONLINE]\n\nWelcome, operator. Your terminal is ready.', Markup.inlineKeyboard([
        [Markup.button.callback('🚀 START SNIPER', 'start_sniper')],
        [Markup.button.callback('💰 MY WALLET', 'view_wallet')]
    ]));
});

// Reacție pentru butoane
bot.action('view_wallet', (ctx) => {
    ctx.reply('🏦 Generare portofel securizat... (Web3 Module Loading)');
});

bot.action('start_sniper', (ctx) => {
    ctx.reply('🚀 Sniper activat. Scanning mempool...');
});

// Pornire
bot.launch()
    .then(() => console.log(">>> BOTUL ESTE ONLINE ȘI ASCULTĂ <<<"))
    .catch((err) => console.error("Eroare la pornire:", err));

// Oprire curată
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
