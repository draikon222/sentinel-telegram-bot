const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.start((ctx) => ctx.reply("SUNT LIVE - CODUL NOU REUSIT"));
bot.on('text', (ctx) => ctx.reply("IGNOR TOT - DOAR CODUL NOU EXISTA"));

bot.launch();
console.log("Nucleu pornit.");
