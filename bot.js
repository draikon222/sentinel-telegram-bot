const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const http = require('http');

// 1. Server pentru Render (Previne eroarea "Port scan timeout")
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Sentinel Core System Online');
}).listen(process.env.PORT || 3000);

// 2. Schema Bazei de Date (Structură completă pentru puncte și invitații)
const userSchema = new mongoose.Schema({
  telegramId: Number,
  username: String,
  sntrPoints: { type: Number, default: 0 },
  wallet: { type: String, default: 'Nespecificat' },
  referredBy: Number,
  referralCount: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// 3. Conectare MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://draikon:Gioniluca1980@cluster0.zc3ggbq.mongodb.net/?appName=Cluster0")
  .then(() => console.log("✅ SEIF MONGODB: CONECTAT"))
  .catch(err => console.error("❌ EROARE DB:", err));

// 4. Configurare Bot (Folosește variabila de mediu din Render)
const bot = new Telegraf(process.env.BOT_TOKEN);

// 5. Logica de Start & Referral Automat
bot.start(async (ctx) => {
  const payload = ctx.startPayload; // ID-ul celui care a invitat (dacă există)
  const userId = ctx.from.id;

  try {
    let user = await User.findOne({ telegramId: userId });

    if (!user) {
      user = new User({ 
        telegramId: userId, 
        username: ctx.from.username || 'Anonim' 
      });

      // Dacă a venit prin link de invitație
      if (payload && payload != userId) {
        const referrer = await User.findOne({ telegramId: payload });
        if (referrer) {
          user.referredBy = payload;
          // Recompensă pentru cel care a invitat (ex: 50 SNTR)
          referrer.sntrPoints += 50;
          referrer.referralCount += 1;
          await referrer.save();
          
          // Notificăm invitatorul (opțional)
          bot.telegram.sendMessage(payload, `🎊 Cineva s-a alăturat prin link-ul tău! Ai primit 50 SNTR.`);
        }
      }
      await user.save();
    }

    ctx.reply("🛡️ SENTINEL CORE ACTIV.\n\nSistemul este gata de profit.\n/stats - Verifică balanța\n/referral - Invită prieteni\n/setwallet - Setează portofelul");
  } catch (e) { console.error("Start Error:", e); }
});

// 6. Comenzi Utilizator
bot.command('stats', async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  ctx.reply(`💰 BALANȚĂ: ${user ? user.sntrPoints : 0} SNTR\n👥 Invitați: ${user ? user.referralCount : 0}\n💳 WALLET: ${user?.wallet || 'Nespecificat'}`);
});

bot.command('referral', (ctx) => {
  // ATENȚIE: Schimbă "UsernameReal_bot" cu numele real al botului tău!
  const botUsername = "UsernameReal_bot"; 
  ctx.reply(`🔗 Link-ul tău de invitație:\nhttps://t.me/${botUsername}?start=${ctx.from.id}\n\nPrimești 50 SNTR pentru fiecare prieten invitat!`);
});

bot.command('setwallet', async (ctx) => {
  const address = ctx.message.text.split(' ')[1];
  if (!address || address.length < 30) {
    return ctx.reply("❌ Te rugăm să pui o adresă validă.\nExemplu: /setwallet ADRESA_SOLANA");
  }
  await User.findOneAndUpdate({ telegramId: ctx.from.id }, { wallet: address });
  ctx.reply(`✅ Portofel salvat:\n${address}`);
});

// 7. Lansare
bot.launch({ dropPendingUpdates: true })
  .then(() => console.log("🚀 SENTINEL ESTE LIVE!"))
  .catch(err => console.error("❌ EROARE LA LANSARE:", err));
