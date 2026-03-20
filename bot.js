const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const http = require('http');

http.createServer((req, res) => { res.writeHead(200); res.end('Sentinel Core'); }).listen(process.env.PORT || 3000);

// Schema completă (Aici era buba, trebuiau adăugate câmpurile noi)
const userSchema = new mongoose.Schema({
  telegramId: Number,
  username: String,
  sntrPoints: { type: Number, default: 0 },
  wallet: String,
  referredBy: Number
});
const User = mongoose.model('User', userSchema);

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://draikon:Gioniluca1980@cluster0.zc3ggbq.mongodb.net/?appName=Cluster0")
  .then(() => console.log("✅ DB_OK"))
  .catch(err => console.error("❌ DB_ERR:", err));

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
  try {
    let user = await User.findOne({ telegramId: ctx.from.id });
    if (!user) {
      user = new User({ telegramId: ctx.from.id, username: ctx.from.username });
      await user.save();
    }
    ctx.reply("🛡️ SENTINEL CORE ACTIV.\n/stats - Balanță\n/referral - Link invitație");
  } catch (e) { console.error(e); }
});

bot.command('stats', async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  ctx.reply(`💰 SNTR: ${user ? user.sntrPoints : 0}\n💳 Wallet: ${user?.wallet || 'Nespecificat'}`);
});

bot.command('referral', (ctx) => {
  ctx.reply(`🔗 Link-ul tău: https://t.me/NumeleBotuluiTau?start=${ctx.from.id}`);
});

bot.launch({ dropPendingUpdates: true });
