const { Telegraf, Markup } = require('telegraf');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const http = require('http');

http.createServer((req, res) => { res.writeHead(200); res.end('Sentinel Referral Engine Online'); }).listen(process.env.PORT || 3000);

const bot = new Telegraf(process.env.BOT_TOKEN);
const connection = new Connection("https://api.mainnet-beta.solana.com", 'confirmed');
const MY_TREASURY = 'J5MxnGsFa79EeQS6kAMcGLTK3kXXvC39TjEhj7BkD6bk';

// Configurare Taxe
const TOTAL_FEE = 0.01; // 1%
const REF_SHARE = 0.3;  // 30% din taxă merge la cel care a invitat

bot.start((ctx) => {
    const payload = ctx.startPayload; // Aici e ID-ul celui care a invitat
    const welcomeMsg = `🛡️ **SENTINEL CORE V2.2**\n\n` +
        `• Taxă: 1%\n` +
        `• **Sistem Referral ACTIV** (Câștigă 30% din taxele prietenilor!)\n\n` +
        `Link-ul tău de invitare:\n\`https://t.me/${ctx.botInfo.username}?start=${ctx.from.id}\``;

    ctx.replyWithMarkdown(welcomeMsg, Markup.inlineKeyboard([
        [Markup.button.callback('💰 PROFITUL MEU', 'check_balance')],
        [Markup.button.callback('👥 REFERRALS', 'view_refs')]
    ]));
});

// Vizualizare Referrals
bot.action('view_refs', (ctx) => {
    ctx.replyWithMarkdown(`👥 **SISTEM REFERRAL**\n\nDistribuie link-ul tău:\n\`https://t.me/${ctx.botInfo.username}?start=${ctx.from.id}\`\n\nVei primi **0.3%** din fiecare tranzacție făcută de cei invitați!`);
});

// Logica de plată simulată cu split de taxă
bot.action(/buy_(.*)/, (ctx) => {
    const amount = parseFloat(ctx.match[1]);
    const totalTax = amount * TOTAL_FEE;
    const refTax = totalTax * REF_SHARE;
    const myTax = totalTax - refTax;

    ctx.answerCbQuery(`Split Taxă: Tu primești ${myTax.toFixed(4)} SOL | Ref primește ${refTax.toFixed(4)} SOL`, { show_alert: true });
    ctx.reply(`🚀 Tranzacție reușită!\n💎 Profitul tău (0.7%): ${myTax.toFixed(4)} SOL\n👥 Comision Ref (0.3%): ${refTax.toFixed(4)} SOL`);
});

bot.launch();
