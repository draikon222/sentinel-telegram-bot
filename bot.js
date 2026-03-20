const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const http = require('http');

// --- REPARARE SERVER RENDER (Elimină eroarea de Port) ---
// Render așteaptă un port deschis. Îi dăm acest server minim ca să fie "verde".
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Sentinel Core is Active');
}).listen(process.env.PORT || 3000);

// --- CONECTARE MONGODB ATLAS ---
const mongoURI = "mongodb+srv://draikon:Gioniluca1980@cluster0.zc3ggbq.mongodb.net/?appName=Cluster0";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ SEIF MONGODB: CONECTAT"))
  .catch(err => console.error("❌ EROARE MONGODB:", err));

// --- CONFIGURARE BOT TELEGRAM ---
// ÎNLOCUIEȘTE DOAR TEXTUL DE MAI JOS CU TOKEN-UL TĂU REAL
const bot = new Telegraf('AICI_PUNE_TOKENUL_TAU_DE_LA_BOTFATHER');

// Structura Bazei de Date pentru Useri
const User = mongoose.model('User', {
  telegramId: Number,
  username: String,
  sntrPoints: { type: Number, default: 0 },
  referredBy: Number,
  wallet: { type: String, default: 'None' }
});

// Comanda /start cu Sistem de Referral
bot.start(async (ctx) => {
  try {
    const refId = ctx.startPayload; // ID-ul celui care a trimis link-ul
    let user = await User.findOne({ telegramId: ctx.from.id });

    if (!user) {
      user = new User({ 
        telegramId: ctx.from.id,
        username: ctx.from.username || 'Unknown',
        referredBy: refId ? parseInt(refId) : null
      });
      await user.save();
      ctx.reply("🛡️ SENTINEL CORE: Profil Creat. Bun venit în sistem!");
    } else {
      ctx.reply("🛡️ SENTINEL CORE: Acces autorizat. Bun venit înapoi.");
    }
  } catch (err) {
    console.error("Eroare la start:", err);
  }
});

// Comanda /stats pentru verificarea punctelor
bot.command('stats', async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  if (user) {
    ctx.reply(`📊 STATISTICI:\n💰 SNTR: ${user.sntrPoints}\n👤 User ID: ${user.telegramId}`);
  }
});

// Pornire Bot
bot.launch()
  .then(() => console.log("🚀 SENTINEL BOT ESTE ONLINE!"))
  .catch((err) => console.error("❌ EROARE LANSARE TELEGRAM (Verifică Token-ul):", err));

// Oprire sigură
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
