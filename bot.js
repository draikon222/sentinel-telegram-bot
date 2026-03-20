const { Telegraf, Markup } = require('telegraf');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const http = require('http');

// 1. FIX PENTRU RENDER (Imaginea 11635.jpg)
// Serverul pornește imediat pe portul 10000 pentru a evita timeout-ul
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Sentinel Core V3.2 is Running');
}).listen(PORT, '0.0.0.0', () => {
    console.log(`>>> Server activ pe portul ${PORT} <<<`);
});

// 2. CONFIGURARE BOT & SOLANA
const bot = new Telegraf(process.env.BOT_TOKEN);
const connection = new Connection("https://api.mainnet-beta.solana.com", 'confirmed');
const MY_TREASURY = 'J5MxnGsFa79EeQS6kAMcGLTK3kXXvC39TjEhj7BkD6bk';

// 3. COMANDA START (Imaginea 11615.jpg)
bot.start((ctx) => {
    const refLink = `https://t.me/${ctx.botInfo.username}?start=${ctx.from.id}`;
    ctx.replyWithMarkdown(
        `🛡️ **SENTINEL CORE V3.2 - ELITE**\n\n` +
        `• Taxă rețea: 1%\n` +
        `• Viteză: Mainnet Optimized\n` +
        `• Referral: 30% PROFIT PENTRU TINE\n\n` +
        `Trimite o adresă de contract (CA) pentru a cumpăra.\n\n` +
        `Link-ul tău de invitare:\n\`${refLink}\``,
        Markup.inlineKeyboard([
            [Markup.button.callback('💰 PROFITUL MEU', 'check_balance')],
            [Markup.button.callback('👥 REFERRALS', 'view_refs')]
        ])
