const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const http = require('http');

// Server pentru Render (Port Binding)
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Sentinel Core Active');
}).listen(process.env.PORT || 3000);

// Conectare MongoDB
const mongoURI = "mongodb+srv://draikon:Gioniluca1980@cluster0.zc3ggbq.mongodb.net/?appName=Cluster0";
mongoose.connect(mongoURI)
  .then(() => console.log("✅ DB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// Configurare Bot
const token = '7282819876:AAHy16b0R43_M4wM6_jM1G45N3C1F1F';
const bot = new Telegraf(token);

const User = mongoose.model('User', {
  telegramId: Number,
  username: String,
  sntrPoints: { type: Number, default: 0 }
});

bot.start(async (ctx) => {
  try {
    let user = await User.findOne({ telegramId: ctx.from.id });
    if (!user) {
      user = new User({ telegramId: ctx.from.id, username: ctx.from.username || 'Unknown' });
      await user.save();
    }
    await ctx.reply("🛡️ SENTINEL CORE ONLINE.\nFolosește /stats pentru balanță.");
  } catch (e) {
    console.error("Reply error:", e);
  }
});

bot.command('stats', async (ctx) => {
  try {
    const user = await User.findOne({ telegramId: ctx.from.id });
    ctx.reply(`💰 Balanța ta: ${user ? user.sntrPoints : 0} SNTR`);
  } catch (e) { console.error(e); }
});

// Pornire fără mizerii de SIGINT/SIGTERM care blochează Render
bot.launch({ dropPendingUpdates: true })
  .then(() => console.log("🚀 BOT LIVE"));
