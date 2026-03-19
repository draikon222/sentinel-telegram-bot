const { Telegraf, Markup } = require('telegraf');
const { Connection, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const http = require('http');

// 1. Server pentru a menține botul activ pe Render
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Sentinel Core Web3 Online');
}).listen(process.env.PORT || 3000);

// 2. Configurare conexiune Solana (Mainnet)
const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
const MY_WALLET = 'J5MxnGsFa79EeQS6kAMcGLTK3kXXvC39TjEhj7BkD6bk';

// 3. Inițializare Bot (Token-ul rămâne secret în Render)
const bot = new Telegraf(process.env.BOT_TOKEN);

// Meniu Principal
bot.start((ctx) => {
    ctx.replyWithMarkdown('🛡️ **SENTINEL CORE V1.0**\n\nSistemul este conectat la Solana Mainnet.\n\n`Wallet:` ' + MY_WALLET, Markup.inlineKeyboard([
        [Markup.button.callback('💰 VERIFICĂ BALANȚĂ', 'check_balance')],
        [Markup.button.callback('🚀 START SNIPER', 'start_sniper')],
        [Markup.button.callback('⚙️ SETĂRI', 'settings')]
    ]));
});

// Logica pentru Butonul de Balanță
bot.action('check_balance', async (ctx) => {
    try {
        await ctx.answerCbQuery('Se accesează blockchain-ul...');
        const publicKey = new PublicKey(MY_WALLET);
        const balance = await connection.getBalance(publicKey);
        const solBalance = balance / 1000000000;

        ctx.replyWithMarkdown(`🏦 **DETALII PORTOFEL**\n\n**Adresă:** \`${MY_WALLET}\`\n**Balanță:** \`${solBalance.toFixed(4)} SOL\``);
    } catch (error) {
        console.error(error);
        ctx.reply('❌ Eroare la citirea datelor de pe Solana. Verifică conexiunea.');
    }
});

bot.action('start_sniper', (ctx) => {
    ctx.reply('🚀 Sniper-ul este în modul "Watch Only". Scanez Raydium & Pump.fun pentru contracte noi...');
});

bot.action('settings', (ctx) => {
    ctx.reply('⚙️ Configurare: Slippage 10% | Priority Fee: Default.');
});

// Lansare
bot.launch()
    .then(() => console.log(">>> SENTINEL WEB3 READY <<<"))
    .catch(err => console.error("Eroare pornire:", err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
