const { Telegraf, Markup } = require('telegraf');
const http = require('http');

// Server pentru Render ca să nu mai dea eroare de port
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Sentinel Core V1 Online');
});
server.listen(process.env.PORT || 3000);

// BOTUL IA TOKEN-UL DIN RENDER (Să fie protejat)
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
    ctx.replyWithMarkdown('🛡️ **SENTINEL CORE V1.0**\n[ONLINE]\n\nTerminal securizat. Bine ai venit, operator.', Markup.inlineKeyboard([
        [Markup.button.callback('🚀 START SNIPER', 'start')],
        [Markup.button.callback('💰 MY WALLET', 'wallet')]
    ]));
});

bot.action('wallet', (ctx) => ctx.reply('🏦 Generare portofel... Modulul Solana Web3 este în curs de activare.'));
bot.action('start', (ctx) => ctx.reply('🚀 Scanare mempool pornită...'));

bot.launch().then(() => console.log(">>> SENTINEL ESTE LIVE <<<"));

// Oprire sigură
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
