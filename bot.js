const { Telegraf, Markup } = require('telegraf');

// Citim token-ul din setarile Render (mai sigur)
const bot = new Telegraf(process.env.BOT_TOKEN);

const welcomeMessage = `
🛡️ **SENTINEL CORE V1.0**
[SECURED ACCESS]
--------------------------
SYSTEM: ONLINE
--------------------------
Ready for commands, operator.
`;

bot.start((ctx) => {
    ctx.replyWithMarkdown(welcomeMessage, Markup.inlineKeyboard([
        [Markup.button.callback('🚀 START SNIPER', 'start_sniper')],
        [Markup.button.callback('💰 MY WALLET', 'view_wallet')]
    ]));
});

bot.launch().then(() => console.log("Bot is LIVE!"));
