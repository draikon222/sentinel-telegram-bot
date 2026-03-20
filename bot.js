const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');

// --- CONECTARE SEIF MONGODB ---
const mongoURI = "mongodb+srv://draikon:Gioniluca1980@cluster0.zc3ggbq.mongodb.net/?appName=Cluster0";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ Seiful Sentinel este deschis!"))
  .catch(err => console.log("❌ Eroare la seif:", err));

// --- CONFIGURARE BOT ---
const bot = new Telegraf('AICI_PUNE_TOKEN_UL_TAU_DE_LA_BOTFATHER');

// Model pentru Useri (Bani, Referral, Portofel)
const User = mongoose.model('User', {
  telegramId: Number,
  wallet: String,
  sntrPoints: { type: Number, default: 0 },
  referredBy: Number
});

// Comanda /start cu Sistem de Referral
bot.start(async (ctx) => {
  const refId = ctx.startPayload; // Luăm ID-ul celui care a invitat
  
  let user = await User.findOne({ telegramId: ctx.from.id });
  
  if (!user) {
    user = new User({ 
      telegramId: ctx.from.id,
      referredBy: refId ? parseInt(refId) : null
    });
    await user.save();
    ctx.reply("🛡️ Bine ai venit în Sentinel! Seiful tău a fost creat.");
  } else {
    ctx.reply("🛡️ Bine ai revenit, Operative!");
  }
});

bot.launch();
