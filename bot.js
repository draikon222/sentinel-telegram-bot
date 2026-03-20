const { Telegraf, Markup } = require('telegraf');
const mongoose = require('mongoose');
const http = require('http');

http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Sentinel Core System Online');
}).listen(process.env.PORT || 3000);

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://draikon:Gioniluca1980@cluster0.zc3ggbq.mongodb.net/?appName=Cluster0")
  .then(() => console.log("✅ SEIF MONGODB: CONECTAT"))
  .catch(err => console.error("❌ EROARE DB:", err));

const User = mongoose.model('User', {
  telegramId: Number,
  username: String,
  sntrPoints: { type: Number, default: 0 },
  wallet: { type: String, default: 'Nespecificat' },
  referredBy: Number,
  referralCount: { type: Number, default: 0 },
  lastDaily: { type: Date, default: new Date(0) } // Data pentru bonus zilnic
});

const bot = new Telegraf(process.env.BOT_TOKEN);

// MENIU NOU CU DAILY REWARD
const mainMenu = Markup.keyboard([
  ['💰 Balanță', '🎁 Daily Reward'],
  ['🔗 Invită Prieteni', '💳 Setează Portofel'],
  ['ℹ️ Ajutor']
]).resize();

bot.start(async (ctx) => {
  const payload = ctx.startPayload; 
  const userId = ctx.from.id;
  try {
    let user = await User.findOne({ telegramId: userId });
    if (!user) {
      user = new User({ telegramId: userId, username: ctx.from.username || 'Anonim' });
      if (payload && payload != userId) {
        const referrer = await User.findOne({ telegramId: payload });
        if (referrer) {
          user.referredBy = payload;
          referrer.sntrPoints += 50;
          referrer.referralCount += 1;
          await referrer.save();
          bot.telegram.sendMessage(payload, `🎊 Cineva s-a alăturat! Ai primit 50 SNTR.`);
        }
      }
      await user.save();
    }
    ctx.reply("🛡️ SENTINEL CORE ACTIV.", mainMenu);
  } catch (e) { console.error(e); }
});

bot.hears('💰 Balanță', async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  ctx.reply(`📊 STATUS CONT:\n\n💰 SNTR: ${user ? user.sntrPoints : 0}\n👥 Invitați: ${user ? user.referralCount : 0}\n💳 Portofel: ${user?.wallet || 'Nespecificat'}`);
});

// LOGICA PENTRU BONUS ZILNIC
bot.hears('🎁 Daily Reward', async (ctx) => {
  const userId = ctx.from.id;
  const user = await User.findOne({ telegramId: userId });
  
  const now = new Date();
  const diff = now - user.lastDaily;
  const hoursLeft = 24 - Math.floor(diff / (1000 * 60 * 60));

  if (diff < 24 * 60 * 60 * 1000) {
    return ctx.reply(`⏳ Ai răbdare! Poți cere următorul bonus peste ${hoursLeft} ore.`);
  }

  user.sntrPoints += 20; // Bonusul zilnic
  user.lastDaily = now;
  await user.save();
  
  ctx.reply("✅ Ai primit 20 SNTR! Revino mâine pentru mai mult.");
});

bot.hears('🔗 Invită Prieteni', (ctx) => {
  const botUsername = "SentinelCoreV1_bot"; 
  ctx.reply(`🚀 Invită-ți prietenii și primește 50 SNTR!\n\n🔗 Link-ul tău:\nhttps://t.me/${botUsername}?start=${ctx.from.id}`);
});

bot.hears('💳 Setează Portofel', (ctx) => {
  ctx.reply("Trimite comanda: `/setwallet ADRESA_TA`", { parse_mode: 'Markdown' });
});

bot.on('text', async (ctx) => {
  const msg = ctx.message.text;
  if (msg.toLowerCase().startsWith('/setwallet')) {
    const parts = msg.split(' ');
    if (parts.length > 1) {
      const address = parts[1].trim();
      if (address.length > 20) {
        await User.findOneAndUpdate({ telegramId: ctx.from.id }, { wallet: address });
        return ctx.reply(`✅ Portofel salvat:\n${address}`);
      }
    }
    return ctx.reply("❌ Te rog trimite: `/setwallet AdresaTa`", { parse_mode: 'Markdown' });
  }
  if (msg === 'ℹ️ Ajutor') {
    return ctx.reply("🛡️ Sentinel Core\n/start - Meniu\n/setwallet [adresă] - Salvare portofel");
  }
});

bot.launch({ dropPendingUpdates: true });
