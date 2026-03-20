const { Telegraf, Markup } = require('telegraf');
const mongoose = require('mongoose');
const http = require('http');

// Server pentru Render să nu se închidă
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Sentinel Core System Online');
}).listen(process.env.PORT || 3000);

// Conectare la Seiful MongoDB
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
  lastDaily: { type: Date, default: new Date(0) }
});

const bot = new Telegraf(process.env.BOT_TOKEN);

// ADRESA TA PENTRU COMISIOANE
const ADMIN_WALLET = "J5MxnGsFa79EeQS6kAMcGLTK3kXXvC39TjEhj7BkD6bk"; 

// MENIUL COMPLET
const mainMenu = Markup.keyboard([
  ['💰 Balanță', '🎁 Daily Reward'],
  ['🔗 Invită Prieteni', '💸 Trimite/Plătește SOL'],
  ['💳 Setează Portofel', 'ℹ️ Ajutor']
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
    ctx.reply("🛡️ SENTINEL CORE ACTIV. BANI REALI, RECOMPENSE REALE.", mainMenu);
  } catch (e) { console.error(e); }
});

bot.hears('💰 Balanță', async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  ctx.reply(`📊 STATUS CONT:\n\n💰 SNTR: ${user ? user.sntrPoints : 0}\n👥 Invitați: ${user ? user.referralCount : 0}\n💳 Portofel: ${user?.wallet || 'Nespecificat'}`);
});

bot.hears('🎁 Daily Reward', async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  const now = new Date();
  const diff = now - user.lastDaily;
  if (diff < 24 * 60 * 60 * 1000) {
    const hoursLeft = 24 - Math.floor(diff / (1000 * 60 * 60));
    return ctx.reply(`⏳ Mai ai de așteptat ${hoursLeft} ore.`);
  }
  user.sntrPoints += 20;
  user.lastDaily = now;
  await user.save();
  ctx.reply("✅ Ai primit 20 SNTR bonus zilnic!");
});

bot.hears('🔗 Invită Prieteni', (ctx) => {
  ctx.reply(`🚀 Invită prieteni și ia 50 SNTR!\n\n🔗 Link:\nhttps://t.me/SentinelCoreV1_bot?start=${ctx.from.id}`);
});

bot.hears('💸 Trimite/Plătește SOL', (ctx) => {
  ctx.reply(`💸 **SENTINEL PAY (1% Fee)**\n\nTrimite SOL oriunde cu comision de 1%.\n🎁 **BONUS:** 500 SNTR cadou la fiecare plată!\n\nComandă: \`/pay [adresă] [sumă]\``, { parse_mode: 'Markdown' });
});

bot.on('text', async (ctx) => {
  const msg = ctx.message.text;

  if (msg.toLowerCase().startsWith('/pay')) {
    const parts = msg.split(' ');
    if (parts.length < 3) return ctx.reply("❌ Format: `/pay Adresă Sumă`", { parse_mode: 'Markdown' });
    const dest = parts[1];
    const amount = parseFloat(parts[2]);
    if (isNaN(amount) || amount <= 0) return ctx.reply("❌ Sumă invalidă!");
    
    const fee = amount * 0.01;
    const total = amount + fee;

    return ctx.reply(`📊 **NOTĂ DE PLATĂ**\n\n🔹 Destinatar: \`${dest}\`\n🔹 Sumă: \`${amount} SOL\`\n🔹 Comision (1%): \`${fee.toFixed(4)} SOL\`\n\n⚠️ **DE TRIMIS:** \`${total.toFixed(4)} SOL\`\n\nTrimite la adresa Sentinel:\n\`${ADMIN_WALLET}\`\n\nDupă plată, trimite Signature pentru bonusul de 500 SNTR!`, { parse_mode: 'Markdown' });
  }

  if (msg.toLowerCase().startsWith('/setwallet')) {
    const address = msg.split(' ')[1];
    if (address && address.length > 20) {
      await User.findOneAndUpdate({ telegramId: ctx.from.id }, { wallet: address });
      ctx.reply(`✅ Portofel salvat:\n${address}`);
    }
  }
});

bot.launch({ dropPendingUpdates: true });
