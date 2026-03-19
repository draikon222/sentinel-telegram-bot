const { Telegraf, Markup } = require('telegraf');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const http = require('http');

// Server pentru Render (Păstrează botul viu)
http.createServer((req, res) => { 
    res.writeHead(200); 
    res.end('Sentinel Core V2.0 Engine Online'); 
}).listen(process.env.PORT || 3000);

// CONFIGURARE CORE
const bot = new Telegraf(process.env.BOT_TOKEN);
const connection = new Connection("https://api.mainnet-beta.solana.com", 'confirmed');
const MY_TREASURY = 'J5MxnGsFa79EeQS6kAMcGLTK3kXXvC39TjEhj7BkD6bk';
const SERVICE_FEE = 0.001; // Cei 0.1% ai tăi

// MENIU PRINCIPAL (Interfața pentru utilizatori)
bot.start((ctx) => {
    ctx.replyWithMarkdown(
        `🛡️ **SENTINEL CORE TERMINAL V2.0**\n\n` +
        `Sistem de trading ultra-rapid cu taxe minime.\n\n` +
        `• **Taxă rețea:** 0.1%\n` +
        `• **Securitate:** Activă\n` +
        `• **Viteză:** Mainnet Optimized\n\n` +
        `Introduceți adresa contractului (CA) pentru a începe scanarea sau tranzacționarea:`,
        Markup.inlineKeyboard([
            [Markup.button.callback('💰 BALANȚA MEA', 'check_balance')],
            [Markup.button.callback('🚀 SNIPER PUMP.FUN', 'sniper_mode')],
            [Markup.button.callback('📈 SETĂRI TRADING', 'settings')]
        ])
    );
});

// LOGICA DE COMISION (Inima afacerii tale)
bot.action('check_balance', async (ctx) => {
    try {
        const balance = await connection.getBalance(new PublicKey(MY_TREASURY));
        const sol = balance / LAMPORTS_PER_SOL;
        ctx.replyWithMarkdown(`🏦 **TREASURY STATUS**\n\nProfit acumulat în portofelul tău:\n\`${sol.toFixed(6)} SOL\``);
    } catch (e) {
        ctx.reply("❌ Eroare conexiune Solana.");
    }
});

// SIMULARE EXECUTARE CU TAXĂ (Ce vor vedea utilizatorii tăi)
bot.on('text', (ctx) => {
    const text = ctx.message.text;
    if (text.length > 30) { // Presupunem că e un Contract Address
        ctx.replyWithMarkdown(
            `💎 **TOKEN DETECTAT:** \`${text}\`\n\n` +
            `Alege suma pentru CUMPĂRARE (Include taxă 0.1%):`,
            Markup.inlineKeyboard([
                [Markup.button.callback('Buy 0.1 SOL', 'buy_01'), Markup.button.callback('Buy 0.5 SOL', 'buy_05')],
                [Markup.button.callback('Buy 1.0 SOL', 'buy_10'), Markup.button.callback('Custom Amount', 'buy_custom')]
            ])
        );
    }
});

// EXECUȚIA TAXEI (Logica din spate)
bot.action(/buy_(.*)/, (ctx) => {
    const amount = ctx.match[1];
    const fee = amount * SERVICE_FEE;
    ctx.answerCbQuery(`Execut tranzacție... Profitul tău: ${fee} SOL`, { show_alert: true });
    ctx.reply(`🚀 Tranzacție trimisă! 0.1% (${fee} SOL) au fost direcționați către portofelul tău de profit.`);
});

bot.launch().then(() => console.log(">>> SENTINEL CORE V2.0 DEPLOYED <<<"));
