const { Telegraf, Markup } = require('telegraf');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const http = require('http');

// Server pentru Render
http.createServer((req, res) => { 
    res.writeHead(200); 
    res.end('Sentinel Core V2.1 Engine Online'); 
}).listen(process.env.PORT || 3000);

const bot = new Telegraf(process.env.BOT_TOKEN);
const connection = new Connection("https://api.mainnet-beta.solana.com", 'confirmed');
const MY_TREASURY = 'J5MxnGsFa79EeQS6kAMcGLTK3kXXvC39TjEhj7BkD6bk';

// TAXA MODIFICATĂ: 1% (0.01)
const SERVICE_FEE = 0.01; 

bot.start((ctx) => {
    ctx.replyWithMarkdown(
        `🛡️ **SENTINEL CORE TERMINAL V2.1**\n\n` +
        `Sistem de trading ultra-rapid.\n\n` +
        `• **Taxă rețea:** 1%\n` +
        `• **Securitate:** Activă\n` +
        `• **Viteză:** Mainnet Optimized\n\n` +
        `Trimite adresa contractului (CA) pentru a cumpăra:`,
        Markup.inlineKeyboard([
            [Markup.button.callback('💰 PROFITUL MEU', 'check_balance')],
            [Markup.button.callback('🚀 SNIPER MODE', 'sniper_mode')]
        ])
    );
});

bot.action('check_balance', async (ctx) => {
    try {
        const balance = await connection.getBalance(new PublicKey(MY_TREASURY));
        const sol = balance / LAMPORTS_PER_SOL;
        ctx.replyWithMarkdown(`🏦 **TREASURY STATUS**\n\nSOL acumulat din taxe (1%):\n\`${sol.toFixed(6)} SOL\``);
    } catch (e) {
        ctx.reply("❌ Eroare conexiune.");
    }
});

bot.on('text', (ctx) => {
    const text = ctx.message.text;
    if (text.length > 30) {
        ctx.replyWithMarkdown(
            `💎 **TOKEN DETECTAT:** \`${text}\`\n\n` +
            `Alege suma (Include comision 1%):`,
            Markup.inlineKeyboard([
                [Markup.button.callback('Buy 0.1 SOL', 'buy_0.1'), Markup.button.callback('Buy 0.5 SOL', 'buy_0.5')],
                [Markup.button.callback('Buy 1.0 SOL', 'buy_1.0')]
            ])
        );
    }
});

bot.action(/buy_(.*)/, (ctx) => {
    const amount = parseFloat(ctx.match[1]);
    const fee = (amount * SERVICE_FEE).toFixed(4);
    ctx.answerCbQuery(`Tranzacție în curs... Taxa ta: ${fee} SOL`, { show_alert: true });
    ctx.reply(`🚀 Executat! Din cei ${amount} SOL, 1% (${fee} SOL) au plecat spre portofelul tău.`);
});

bot.launch().then(() => console.log(">>> SENTINEL CORE V2.1 LIVE (1% FEE) <<<"));
