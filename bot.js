const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const http = require('http');

// --- SERVER PENTRU RENDER (Rezolvă eroarea de Port) ---
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Sentinel is Running');
}).listen(process.env.PORT || 3000);

// --- CONECTARE SEIF MONGODB ---
const mongoURI = "mongodb+srv://draikon:Gioniluca1980@cluster0.zc3ggbq.mongodb.net/?appName=Cluster0";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ Seiful Sentinel este deschis!"))
  .catch(err => console.error("❌ Eroare la seif:", err));

// --- CONFIGURARE BOT ---
// !!! ATENȚIE: Șterge tot ce e între ghilimele și pune Token-ul tău curat !!!
const bot = new Telegraf('AICI_PUNE_TOKENUL_TAU_FARA_SPATII');

const User = mongoose.model('User', {
  telegramId: Number,
  wallet: String,
  sntrPoints: { type: Number, default: 0 },
  referredBy: Number
});

bot.start(async (ctx) => {
  try {
    const refId = ctx.startPayload;
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
  } catch (err) { console.error(err); }
});

bot.launch()
  .then(() => console.log("🚀 Botul este ONLINE!"))
  .catch((err) => console.error("❌ Eroare Launch:", err));
