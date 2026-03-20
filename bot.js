const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const http = require('http');

// Server minim pentru a păstra Render activ
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Sentinel Online');
}).listen(process.env.PORT || 3000);

// Conectare MongoDB
const mongoURI = "mongodb+srv://draikon:Gioniluca1980@cluster0.zc3ggbq.mongodb.net/?appName=Cluster0";
mongoose.connect(mongoURI)
  .then(() => console.log("DB_OK"))
  .catch(err => console.log("DB_ERR:", err));

// Configurare Bot
const bot = new Telegraf('7282819876:AAHy16b0R43_M4wM6_jM1G45N3C1F1F');

// Schema simplă
const User = mongoose.model('User', {
  telegramId: Number,
  sntrPoints: { type: Number, default: 0 }
});

bot.start(async (ctx) => {
  try {
    let user = await User.findOne({ telegramId: ctx.from.id });
    if (!user) {
      user = new User({ telegramId: ctx.from.id });
      await user.save();
    }
    ctx.reply("🛡️ SENTINEL CORE ACTIV.\nFolosește /stats");
  } catch (e) { console.log(e); }
});

bot.command('stats', async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  ctx.reply(`💰 SNTR: ${user ? user.sntrPoints : 0}`);
});

bot.launch({ dropPendingUpdates: true });
console.log("BOT_READY");
