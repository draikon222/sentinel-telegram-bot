const { Telegraf, Markup } = require('telegraf');

// TOKEN-UL EXACT DIN POZA TA
const bot = new Telegraf('8561401872:AAF-s8kvSzpPCBGuybhKwkXQRwt-_bemuXI');

const welcomeMessage = `
🛡️ **SENTINEL CORE V1.0**
[SECURED ACCESS GRANTED]
--------------------------
SYSTEM STATUS: ONLINE
NODE STATUS: READY
--------------------------
Welcome, operator. Use the dashboard below to manage your assets and sniper settings.
`;

bot.start((ctx) => {
    ctx.replyWithMarkdown(welcomeMessage, Markup.inlineKeyboard([
        [Markup.button.callback('🚀 START SNIPER', 'start_sniper')],
        [Markup.button.callback('💰 MY WALLET', 'view_wallet'), Markup.button.callback('⚙️ SETTINGS', 'settings')]
    ]));
});

bot.action('view_wallet', (ctx) => {
    ctx.reply(`🏦 WALLET DEPOSIT (SOL):\n\nYour dedicated Sentinel wallet:\n[GENERATING...]\n\nBalance: 0.00 SOL`);
});

bot.launch().then(() => {
    console.log("Sentinel Core is live on Telegram!");
}).catch((err) => {
    console.error("Error starting bot:", err);
});
