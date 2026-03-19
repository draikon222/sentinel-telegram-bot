const { Telegraf, Markup } = require('telegraf');
const http = require('http');

// Server minim pentru a menține serviciul activ pe Render
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Sentinel Core Online');
});
server.listen(process.env.PORT || 3000);

// Botul extrage token-ul direct din setările Render (Environment Variables)
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
    ctx.replyWithMarkdown('🛡️ **SENTINEL CORE V1.0**\n[SYSTEM ONLINE]\n\nTerminal activat. Aștept comenzi.', Markup.inlineKeyboard([
        [Markup.button.callback('🚀 START SNIPER', 'start_sniper')],
        [Markup.button.callback('💰 MY WALLET', 'view_wallet')]
    ]));
});

bot.action('view_wallet', (ctx) => {
    ctx.reply('🏦 Generare portofel securizat... (Modulul Web3 va fi activat la următorul update)');
});

bot.launch()
    .then(() => console.log(">>> SENTINEL ESTE ONLINE ȘI ASCULTĂ <<<"))
    .catch((err) => console.error("Eroare la pornire:", err));

// Oprire curată a procesului
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
