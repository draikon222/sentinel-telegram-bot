const { Telegraf, Markup } = require('telegraf');
const mongoose = require('mongoose');
const http = require('http');

http.createServer((req, res) => { res.writeHead(200); res.end('Sentinel Core Online'); }).listen(process.env.PORT || 3000);

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://draikon:Gioniluca1980@cluster0.zc3ggbq.mongodb.net/?appName=Cluster0")
  .then(() => console.log("✅ SEIF MONGODB: CONECTAT"))
  .catch(err => console.error("❌ EROARE DB:", err));

const User = mongoose.model('User', {
  telegramId: Number,
  username: String,
  sntrPoints: { type: Number, default: 0 },
  wallet: { type: String, default: 'Nespecificat' },
  referralCount: { type: Number, default: 0 },
  lastDaily: { type: Date, default: new Date(0) }
});

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_WALLET = "J5MxnGsFa79EeQS6kAMcGLTK3kXXvC39TjEhj7BkD6bk"; 

const mainMenu = Markup.keyboard([
  ['💰 Balanță', '🎁 Daily Reward'],
  ['🔗 Invită Prieteni', '💸 Trimite/Plătește SOL'],
  ['🏆 Top 10', '💳 Setează Portofel']
]).resize();

bot.start(async (ctx) => {
  const payload = ctx.startPayload; 
  const userId = ctx.from.id;
  let user = await User.findOne({ telegramId: userId });
  if (!user) {
    user = new User({ telegramId: userId, username: ctx.from.username || 'Anonim' });
    if (payload && payload != userId) {
      const referrer = await User.findOne({ telegramId: payload });
      if (referrer) {
        referrer.sntrPoints += 50;
        referrer.referralCount += 1;
        await referrer.save();
        bot.telegram.sendMessage(payload, `🎊 Cineva s-a alăturat! Ai primit 50 SNTR.`);
      }
    }
    await user.save();
  }
  ctx.reply("🛡️ SENTINEL CORE ACTIV. BANI REALI, RECOMPENSE REALE.", mainMenu);
});

bot.hears('💰 Balanță', async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  ctx.reply(`📊 STATUS CONT:\n\n💰 SNTR: ${user?.sntrPoints || 0}\n👥 Invitați: ${user?.referralCount || 0}\n💳 Portofel: ${user?.wallet || 'Nespecificat'}`);
});

bot.hears('🏆 Top 10', async (ctx) => {
  const topUsers = await User.find().sort({ sntrPoints: -1 }).limit(10);
  let leaderMsg = "🏆 **LEADERBOARD SENTINEL CORE**\n\n";
  topUsers.forEach((u, i) => {
    leaderMsg += `${i + 1}. @${u.username || 'Anonim'} - ${u.sntrPoints} SNTR\n`;
  });
  ctx.reply(leaderMsg, { parse_mode: 'Markdown' });
});

bot.hears('🎁 Daily Reward', async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  const now = new Date();
  if (now - user.lastDaily < 24 * 60 * 60 * 1000) return ctx.reply("⏳ Revino mâine!");
  user.sntrPoints += 20;
  user.lastDaily = now;
  await user.save();
  ctx.reply("✅ Ai primit 20 SNTR!");
});

bot.hears('🔗 Invită Prieteni', (ctx) => {
  ctx.reply(`🚀 Invită și ia 50 SNTR!\n\n🔗 https://t.me/SentinelCoreV1_bot?start=${ctx.from.id}`);
});

bot.hears('💸 Trimite/Plătește SOL', (ctx) => {
  ctx.reply(`💸 **SENTINEL PAY (1% Fee)**\n\nComandă: \`/pay [adresă] [sumă]\`\n🎁 Bonus: 500 SNTR!`, { parse_mode: 'Markdown' });
});

bot.on('text', async (ctx) => {
  const msg = ctx.message.text;
  if (msg.startsWith('/pay')) {
    const parts = msg.split(' ');
    if (parts.length < 3) return ctx.reply("❌ Format: `/pay Adresă Sumă`", { parse_mode: 'Markdown' });
    const amount = parseFloat(parts[2]);
    if (isNaN(amount) || amount <= 0) return ctx.reply("❌ Sumă invalidă!");
    const total = amount + (amount * 0.01);
    ctx.reply(`📊 **NOTĂ DE PLATĂ**\n\n⚠️ **DE TRIMIS:** \`${total.toFixed(4)} SOL\`\n\nTrimite la:\n\`${ADMIN_WALLET}\`\n\nPrimești 500 SNTR după confirmare!`, { parse_mode: 'Markdown' });
  }
  if (msg.startsWith('/setwallet')) {
    const address = msg.split(' ')[1];
    if (address) {
      await User.findOneAndUpdate({ telegramId: ctx.from.id }, { wallet: address });
      ctx.reply("✅ Portofel salvat!");
    }
  }
});

bot.launch({ dropPendingUpdates: true });
