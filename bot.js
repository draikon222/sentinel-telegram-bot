const { Telegraf, Markup } = require('telegraf');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const http = require('http');

// 1. Definim variabila 'bot' PRIMA DATĂ
const bot = new Telegraf(process.env.BOT_TOKEN);

// 2. Configurație Solana
const connection = new Connection("https://api.mainnet-beta.solana.com", 'confirmed');
const MY_TREASURY = 'J5MxnGsFa79EeQS6kAMcGLTK3kXXvC39TjEhj7BkD6bk';

// 3. Server pentru Render (să rămână activ)
http.createServer((req, res) => { 
    res.writeHead(200); 
    res.end('Sentinel Core V3.1 Fixed'); 
}).listen(process.env.PORT || 3000);

// 4. Comanda START
bot.start((ctx) => {
    ctx.replyWithMarkdown(
        `🛡️ **SENTINEL CORE V3.1 - FIXED**\n\n` +
        `Trimite o adresă de contract (CA) pentru a începe tranzacționarea.\n\n` +
        `Link-ul tău de invitare:\n\`https://t.me/${ctx.botInfo.username}?start=${ctx.from.id}\``,
        Markup.inlineKeyboard([
            [Markup.button.callback('💰 PROFITUL MEU', 'check_balance')],
            [Markup.button.callback('👥 REFERRALS', 'view_refs')]
        ])
    );
});

// 5. Citire adrese de contract (CA) manuale
bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    if (text.length >= 32 && text.length <= 44 && !text.includes('/')) {
        ctx.replyWithMarkdown(
            `🎯 **TOKEN DETECTAT**\n\`${text}\`\n\nCe vrei să faci?`,
            Markup.inlineKeyboard([
                [Markup.button.callback('🛒 BUY 0.1 SOL', `buy_0.1_${text}`)],
                [Markup.button.callback('🛒 BUY 0.5 SOL', `buy_0.5_${text}`)],
                [Markup.button.url('📊 Chart', `https://dexscreener.com/solana/${text}`)]
            ])
        );
    }
});

// 6. Funcția de Balanță
bot.action('check_balance', async (ctx) => {
    try {
        const bal = await connection.getBalance(new PublicKey(MY_TREASURY));
        ctx.answerCbQuery();
        ctx.replyWithMarkdown(`🏦 **STATUS PROFIT:** \`${(bal / LAMPORTS_PER_SOL).toFixed(6)} SOL\``);
    } catch (e) { ctx.answerCbQuery("Eroare!"); }
});

// 7. Funcția de Referrals
bot.action('view_refs', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithMarkdown(`👥 **REF:** Câștigi 30% din taxe!`);
});

// 8. Pornire bot
bot.launch().then(() => console.log(">>> BOT REPARAT ȘI ONLINE <<<"));
