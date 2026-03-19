const { Telegraf, Markup } = require('telegraf');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const http = require('http');

// Server pentru Render (să nu intre în standby)
http.createServer((req, res) => { res.writeHead(200); res.end('Sentinel V3 Engine Online'); }).listen(process.env.PORT || 3000);

const bot = new Telegraf(process.env.BOT_TOKEN);
const connection = new Connection("https://api.mainnet-beta.solana.com", 'confirmed');
const MY_TREASURY = 'J5MxnGsFa79EeQS6kAMcGLTK3kXXvC39TjEhj7BkD6bk';
const PUMP_FUN_PROGRAM = new PublicKey('6EF8rrecthR5DkwiZX96fba7274KqV7V2bN9VJUEnN7');

// Configurare Taxe
const TOTAL_FEE = 0.01; // 1%
const REF_SHARE = 0.3;  // 30% din taxă pentru cel care a invitat

bot.start((ctx) => {
    ctx.replyWithMarkdown(
        `🛡️ **SENTINEL CORE V3.0 - ELITE**\n\n` +
        `✅ **SCANNER PUMP.FUN:** ACTIV (Alerte instant)\n` +
        `✅ **TAXĂ REȚEA:** 1%\n` +
        `✅ **REF SYSTEM:** 30% PROFIT PENTRU TINE\n\n` +
        `Link-ul tău de invitare:\n\`https://t.me/${ctx.botInfo.username}?start=${ctx.from.id}\``,
        Markup.inlineKeyboard([
            [Markup.button.callback('💰 PROFITUL MEU', 'check_balance')],
            [Markup.button.callback('👥 REFERRALS', 'view_refs')]
        ])
    );
});

// SCANNERUL: Ascultă tot ce apare nou pe Pump.fun
connection.onLogs(PUMP_FUN_PROGRAM, async (logs) => {
    if (logs.logs.some(log => log.includes("InitializeMint"))) {
        const sig = logs.signature;
        // Trimite alerta tuturor utilizatorilor care au dat /start
        // (Aici poți înlocui cu ID-ul tău dacă vrei să-l testezi doar tu la început)
        bot.telegram.sendMessage(process.env.MY_CHAT_ID, 
            `🚀 **ALERTA TOKEN NOU!**\n\n` +
            `Un token tocmai a fost lansat pe Pump.fun!\n\n` +
            `🔗 [Vezi pe DexScreener](https://dexscreener.com/solana/${sig})\n\n` +
            `👇 Cumpără rapid (Taxă 1%):`,
            Markup.inlineKeyboard([
                [Markup.button.callback('🛒 BUY 0.1 SOL', 'buy_0.1'), Markup.button.callback('🛒 BUY 0.5 SOL', 'buy_0.5')]
            ])
        ).catch(e => console.log("Eroare trimitere alertă"));
    }
}, 'confirmed');

bot.action('check_balance', async (ctx) => {
    try {
        const bal = await connection.getBalance(new PublicKey(MY_TREASURY));
        ctx.answerCbQuery();
        ctx.replyWithMarkdown(`🏦 **STATUS TREASURY:**\n\`${(bal / LAMPORTS_PER_SOL).toFixed(6)} SOL\``);
    } catch (e) { ctx.reply("❌ Eroare blockchain."); }
});

bot.action('view_refs', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithMarkdown(`👥 **REFERRALS:** Distribuie link-ul tău și câștigi 30% din taxele lor:\n\`https://t.me/${ctx.botInfo.username}?start=${ctx.from.id}\``);
});

bot.launch().then(() => console.log(">>> SENTINEL V3.0 DEPLOYED <<<"));
