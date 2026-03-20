const { Telegraf, Markup } = require('telegraf');
const mongoose = require('mongoose');
const http = require('http');

// 1. Server pentru Render (Menține serviciul activ)
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Sentinel Core Online');
}).listen(process.env.PORT || 3000);

// 2. Conectare MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://draikon:Gioniluca1980@cluster0.zc3ggbq.mongodb.net/?appName=Cluster0")
  .then(() => console.log("✅ SEIF MONGODB: CONECTAT"))
  .catch(err => console.error("❌ EROARE DB:", err));

// 3. Definire Structură Utilizator
const User = mongoose.model('User', {
  telegramId: Number,
  username: String,
  sntrPoints: { type: Number, default: 0 },
  wallet: { type: String, default: 'Nespecificat' },
  referredBy: Number,
  referralCount: { type: Number, default: 0 }
});

const bot = new Telegraf(process.env.BOT_TOKEN);

// Meniu Butoane Principale
const mainMenu = Markup.keyboard([
  ['💰 Balanță', '🔗 Invită Prieteni'],
  ['💳 Setează Portofel', 'ℹ️ Ajutor']
]).resize();

// 4. Logica de Start & Referral
bot.start(async (ctx) => {
  const payload = ctx.startPayload; 
  const userId = ctx.from.id;

  try {
    let user = await User.findOne({ telegramId: userId });

    if (!user) {
      user = new User({ 
        telegramId: userId, 
        username: ctx.from.username || 'Anonim' 
      });

      if (payload && payload != userId) {
        const referrer = await User.findOne({ telegramId: payload });
        if (referrer) {
          user.referredBy = payload;
          referrer.sntrPoints += 50; 
          referrer.referralCount += 1;
          await referrer.save();
          
          bot.telegram.sendMessage(payload, `🎊 Cineva s-a alăturat prin link-ul tău! Ai primit 50 SNTR.`);
        }
      }
      await user.save();
    }

    ctx.reply("🛡️ BINE AI VENIT ÎN SENTINEL CORE.\nFolosește meniul de mai jos pentru a naviga.", mainMenu);
  } catch (e) { console.error("Start Error:", e); }
});

// 5. Handlers pentru Butoane
bot.hears('💰 Balanță', async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  ctx.reply(`📊 STATUS CONT:\n\n💰 SNTR: ${user ? user.sntrPoints : 0}\n👥 Invitați: ${user ? user.referralCount : 0}\n💳 Portofel: ${user?.wallet || 'Nespecificat'}`);
});

bot.hears('🔗 Invită Prieteni', (ctx) => {
  // Am pus numele exact din BotFather: SentinelCoreV1_bot
  const botUsername = "SentinelCoreV1_bot"; 
  ctx.reply(`🚀 Invită-ți prietenii și primește 50 SNTR pentru fiecare!\n\n🔗 Link-ul tău:\nhttps://t.me/${botUsername}?start=${ctx.from.id}`);
});

bot.hears('💳 Setează Portofel', (ctx) => {
  ctx.reply("Te rog să trimiți comanda /setwallet urmată de adresa ta Solana.\nExemplu: `/setwallet AdresaTa`", { parse_mode: 'Markdown' });
});

bot.hears('ℹ️ Ajutor', (ctx) => {
  ctx.reply("🛡️ Sentinel Core este sistemul tău de monitorizare.\n\nComenzi:\n/start - Meniu\n/setwallet [adresă] - Salvare portofel");
});

// 6. Comandă Manuală Portofel
bot.command('setwallet', async (ctx) => {
  const address = ctx.message.text.split(' ')[1];
  if (address && address.length > 30) {
    await User.findOneAndUpdate({ telegramId: ctx.from.id }, { wallet: address });
    ctx.reply(`✅ Portofel salvat cu succes:\n${address}`);
  } else {
    ctx.reply("❌ Te rugăm să trimiți o adresă validă după comandă.");
  }
});

bot.launch({ dropPendingUpdates: true })
  .then(() => console.log("🚀 BOT LIVE CU MENIU ACTIV!"));
