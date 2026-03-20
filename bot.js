const { Telegraf, Markup } = require('telegraf');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const http = require('http');

// 1. PORNIRE SERVER WEB - ASTA ESTE PRIORITATEA PENTRU RENDER
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Sentinel Core is Running');
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> SERVER ACTIV PE PORTUL ${PORT} <<<`);
});

// 2. CONFIGURARE BOT & SOLANA
const bot = new Telegraf(process.env.BOT_TOKEN);
const connection = new Connection("https://api.mainnet-beta.solana.com", 'confirmed');
const MY_TREASURY = 'J5MxnGsFa79EeQS6kAMcGLTK3kXXvC39TjEhj7BkD6bk';

// 3. COMANDA START
bot.start((ctx) => {
    ctx.replyWithMarkdown(
        `🛡️ **SENTINEL CORE V3.2 - ONLINE**\n\n` +
        `Trimite o adresă de contract (CA) validă.\n\n` +
        `Link-ul tău de invitare:\n\`https://t.me/${ctx.botInfo.username}?start=${ctx.from.id}\``,
        Markup.inlineKeyboard([
            [Markup.button.callback('💰 PROFITUL MEU', 'check_balance')],
            [Markup.button.callback('👥 REFERRALS', 'view_refs')]
        ])
    );
});

// 4. DETECTARE CONTRACT (CA)
bot.on('text', async (ctx) => {
    const text = ctx.message.text.trim();
    if (text.length >= 32 && text.length <= 44 && !text.includes('/')) {
        try {
            const bal = await connection.getBalance(new PublicKey(MY_TREASURY));
            ctx.replyWithMarkdown(
                `🎯 **TOKEN DETECTAT**\n\`${text}\`\n\n` +
                `🏦 **SOLDUL TĂU:** \`${(bal / LAMPORTS_PER_SOL).toFixed(4)} SOL\`\n\n` +
                `Ce vrei să faci?`,
                Markup.inlineKeyboard([
                    [Markup.button.callback('🛒 BUY 0.1 SOL', `buy_0.1_${text}`)],
                    [Markup.button.url('📊 Chart', `https://dexscreener.com/solana/${text}`)]
                ])
            );
        } catch (e) { ctx.reply("❌ Adresă invalidă."); }
    }
});

// 5. HANDLERS BUTOANE
bot.action('check_balance', async (ctx) => {
    const bal = await connection.getBalance(new PublicKey(MY_TREASURY));
    ctx.answerCbQuery();
    ctx.reply(`🏦 SOLD ACTUAL: ${(bal / LAMPORTS_PER_SOL).toFixed(6)} SOL`);
});

bot.action('view_refs', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply(`👥 REF: 30% PROFIT`);
});

// PORNIRE BOT
bot.launch().then(() => console.log(">>> BOTUL A PORNIT CU SUCCES <<<"));
