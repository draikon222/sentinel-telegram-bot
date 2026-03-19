const { Telegraf, Markup } = require('telegraf');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const http = require('http');

http.createServer((req, res) => { res.writeHead(200); res.end('Sentinel V3 Engine Online'); }).listen(process.env.PORT || 3000);

const bot = new Telegraf(process.env.BOT_TOKEN);
const connection = new Connection("https://api.mainnet-beta.solana.com", 'confirmed');
const MY_TREASURY = 'J5MxnGsFa79EeQS6kAMcGLTK3kXXvC39TjEhj7BkD6bk';
const PUMP_FUN_PROGRAM = new PublicKey('6EF8rrecthR5DkwiZX96fba7274KqV7V2bN9VJUEnN7');

bot.start((ctx) => {
    ctx.replyWithMarkdown(
        `🛡️ **SENTINEL CORE V3.0 - ELITE**\n\n` +
        `✅ **SCANNER PUMP.FUN:** ACTIV (Primești alerte instant!)\n` +
        `✅ **TAXĂ:** 1% | **REFERRAL:** 30%\n\n` +
        `Link-ul tău de invitare:\n\`https://t.me/${ctx.botInfo.username}?start=${ctx.from.id}\``,
        Markup.inlineKeyboard([
            [Markup.button.callback('💰 PROFITUL MEU', 'check_balance')],
            [Markup.button.callback('👥 REFERRALS', 'view_refs')]
        ])
    );
});

// SCANNERUL (Ochii botului)
connection.onLogs(PUMP_FUN_PROGRAM, (logs) => {
    if (logs.logs.some(log => log.includes("InitializeMint"))) {
        const sig = logs.signature;
        bot.telegram.sendMessage(process.env.CHAT_ID || 'ID_TAU_TELEGRAM', 
            `🚀 **TOKEN NOU PE PUMP.FUN!**\n\n` +
            `📝 Sig: \`${sig}\`\n` +
            `🔗 [DexScreener](https://dexscreener.com/solana/${sig})\n\n` +
            `👇 Cumpără rapid prin Sentinel (1% fee):`,
            Markup.inlineKeyboard([[Markup.button.callback('🛒 BUY 0.1 SOL', 'buy_0.1')]])
        );
    }
}, 'confirmed');

bot.action('check_balance', async (ctx) => {
    try {
        const bal = await connection.getBalance(new PublicKey(MY_TREASURY));
        ctx.answerCbQuery();
        ctx.replyWithMarkdown(`🏦 **STATUS PROFIT:** \`${(bal / LAMPORTS_PER_SOL).toFixed(6)} SOL\``);
    } catch (e) { ctx.reply("❌ Eroare blockchain."); }
});

bot.action('view_refs', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithMarkdown(`👥 **REFERRAL:** Câștigă 30% din taxe!\nLink: \`https://t.me/${ctx.botInfo.username}?start=${ctx.from.id}\``);
});

bot.launch().then(() => console.log(">>> SENTINEL V3.0 DEPLOYED <<<"));
