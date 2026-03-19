const { Telegraf, Markup } = require('telegraf');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const http = require('http');

http.createServer((req, res) => { res.writeHead(200); res.end('Sentinel Core V2.2 Fixed'); }).listen(process.env.PORT || 3000);

const bot = new Telegraf(process.env.BOT_TOKEN);
const connection = new Connection("https://api.mainnet-beta.solana.com", 'confirmed');
const MY_TREASURY = 'J5MxnGsFa79EeQS6kAMcGLTK3kXXvC39TjEhj7BkD6bk';

bot.start((ctx) => {
    ctx.replyWithMarkdown(
        `🛡️ **SENTINEL CORE V2.2**\n\n` +
        `• Taxă rețea: 1%\n` +
        `• **Sistem Referral:** ACTIV\n\n` +
        `Link-ul tău de invitare:\n\`https://t.me/${ctx.botInfo.username}?start=${ctx.from.id}\``,
        Markup.inlineKeyboard([
            [Markup.button.callback('💰 PROFITUL MEU', 'check_balance')], // Numele intern e check_balance
            [Markup.button.callback('👥 REFERRALS', 'view_refs')]
        ])
    );
});

// FUNCȚIA CARE ÎȚI ARATĂ SOLDUL (Fixată)
bot.action('check_balance', async (ctx) => {
    try {
        const balance = await connection.getBalance(new PublicKey(MY_TREASURY));
        const sol = balance / LAMPORTS_PER_SOL;
        await ctx.answerCbQuery(); // Oprește rotița de încărcare de pe buton
        await ctx.replyWithMarkdown(`🏦 **STATUS PROFIT**\n\nBalanța ta actuală:\n\`${sol.toFixed(6)} SOL\``);
    } catch (e) {
        ctx.reply("❌ Eroare la citirea blockchain-ului.");
    }
});

bot.action('view_refs', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithMarkdown(`👥 **REFERRAL PROGRAM**\n\nCâștigă 30% din taxele celor pe care îi aduci.\nLink: \`https://t.me/${ctx.botInfo.username}?start=${ctx.from.id}\``);
});

bot.launch().then(() => console.log(">>> BOT REPARAT ȘI LIVE <<<"));
