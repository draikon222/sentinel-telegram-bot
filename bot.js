const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const http = require('http');

// 1. Server pentru Render (Port Binding)
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Sentinel Core Active');
}).listen(process.env.PORT || 3000);

// 2. Conectare MongoDB
const mongoURI = "mongodb+srv://draikon:Gioniluca1980@cluster0.zc3ggbq.mongodb.net/?appName=Cluster0";
mongoose.connect(mongoURI).then(() => console.log("✅ SEIF MONGODB: CONECTAT")).catch(err => console.log("❌ EROARE DB:", err));

// 3. Configurare Bot (IA TOKENUL DIN RENDER)
const bot = new Telegraf(process.env.BOT_TOKEN);

// 4. Schema Bază de Date
const User = mongoose.model('User', {
  telegramId: Number,
  sntrPoints: { type: Number, default: 0 }
});

// 5. Comenzi
bot.start(async (ctx) => {
  try {
    let user = await User.findOne({ telegramId: ctx.from.id });
    if (!user) {
      user = new User({ telegramId: ctx.from.id });
      await user.save();
    }
    ctx.reply("🛡️ SENTINEL CORE ACTIV.\nFolosește /stats pentru balanță.");
  } catch (e) { console.log("Start Error:", e); }
});

bot.command('stats', async (ctx) => {
  try {
    const user = await User.findOne({ telegramId: ctx.from.id });
    ctx.reply(`💰 SNTR: ${user ? user.sntrPoints : 0}`);
  } catch (e) { console.log("Stats Error:", e); }
});

// 6. Lansare cu Protecție
bot.launch({ dropPendingUpdates: true })
  .then(() => console.log("🚀 SENTINEL ESTE LIVE ȘI AUTORIZAT!"))
  .catch(err => console.log("❌ EROARE AUTORIZARE (Token-ul de pe Render e prost):", err));
