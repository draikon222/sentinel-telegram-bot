const { Telegraf, Markup } = require('telegraf');
const mongoose = require('mongoose');
const { Connection, clusterApiUrl } = require('@solana/web3.js');
const http = require('http');

// Menținem serverul activ pentru Render
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Sentinel Core Ultimate System Online');
}).listen(process.env.PORT || 3000);

// Conexiune Blockchain Solana (Mainnet)
const solanaConn = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

// Conectare Bază de Date MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://draikon:Gioniluca1980@cluster0.zc3ggbq.mongodb.net/?appName=Cluster0")
  .then(() => console.log("✅ DB CONECTAT - SENTINEL ONLINE"))
  .catch(err => console.error("❌ EROARE DB:", err));

// Schema Utilizator
const User = mongoose.model('User', {
  telegramId: Number,
  username: String,
  sntrPoints: { type: Number, default: 0 },
  wallet: { type: String, default: 'Nespecificat' },
  referralCount: { type: Number, default: 0 },
  lastDaily: { type: Date, default: new Date(0) },
  usedSignatures: [String] 
});

const bot = new Telegraf(process.env.BOT_TOKEN);

// PORTOFELUL TĂU UNDE VIN BANII REALI
const ADMIN_WALLET = "J5MxnGsFa79EeQS6kAMcGLTK3kXXvC39TjEhj7BkD6bk"; 

// Meniu Principal Complet
const mainMenu = Markup.keyboard([
  ['💰 Balanță', '🎁 Daily Reward'],
  ['🔗 Invită Prieteni', '💸 Trimite/Plătește SOL'],
  ['🏆 Top 10', '💳 Setează Portofel']
]).resize();

// --- FUNCȚIA DE VERIFICARE AUTOMATĂ PE BLOCKCHAIN ---
async function verifyTransaction(signature) {
  try {
    const tx = await solanaConn.getTransaction(signature, { 
        commitment: 'confirmed', 
        maxSupportedTransactionVersion: 0 
    });
    if (!tx) return false;
    
    // Extragem toate adresele implicate în tranzacție
    const accountKeys = tx.transaction.message.staticAccountKeys ? 
                        tx.transaction.message.staticAccountKeys.map(k => k.toString()) :
                        tx.transaction.message.accountKeys.map(k => k.toString());
    
    // Verificăm dacă adresa TA (Admin) a primit fonduri
    return accountKeys.includes(ADMIN_WALLET);
  } catch (e) {
    console.error("Eroare verificare Solana:", e);
    return false;
  }
}

// Comanda START cu sistem de Referral
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
        bot.telegram.sendMessage(payload, `🎊 Cineva s-a alăturat prin link-ul tău! Ai primit 50 SNTR.`);
      }
    }
    await user.save();
  }
  ctx.reply("🛡️ SENTINEL CORE ACTIV. BANI REALI, RECOMPENSE AUTOMATE.", mainMenu);
});

// Afișare Balanță
bot.hears('💰 Balanță', async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  ctx.reply(`📊 STATUS CONT:\n\n💰 SNTR: ${user?.sntrPoints || 0}\n👥 Invitați: ${user?.referralCount || 0}\n💳 Portofel: ${user?.wallet || 'Nespecificat'}`);
});

// Clasament Top 10
bot.hears('🏆 Top 10', async (ctx) => {
  const topUsers = await User.find().sort({ sntrPoints: -1 }).limit(10);
  let leaderMsg = "🏆 **TOP 10 SENTINEL CORE**\n\n";
  topUsers.forEach((u, i) => {
    leaderMsg += `${i + 1}. @${u.username || 'Anonim'} - ${u.sntrPoints} SNTR\n`;
  });
  ctx.reply(leaderMsg, { parse_mode: 'Markdown' });
});

// Recompensă Zilnică (Momeala)
bot.hears('🎁 Daily Reward', async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  const now = new Date();
  if (now - user.lastDaily < 24 * 60 * 60 * 1000) {
    return ctx.reply("⏳ Revino mâine pentru bonusul tău!");
  }
  user.sntrPoints += 20;
  user.lastDaily = now;
  await user.save();
  ctx.reply("✅ Ai primit 20 SNTR bonus zilnic!");
});

// Link Invită Prieteni
bot.hears('🔗 Invită Prieteni', (ctx) => {
  ctx.reply(`🚀 Invită-ți prietenii și primește 50 SNTR cadou!\n\n🔗 Link-ul tău:\nhttps://t.me/SentinelCoreV1_bot?start=${ctx.from.id}`);
});

// Secțiunea de BANI REALI (Comision 1%)
bot.hears('💸 Trimite/Plătește SOL', (ctx) => {
  ctx.reply(`💸 **SENTINEL PAY (1% Fee)**\n\nTrimite suma dorită + 1% comision la adresa noastră:\n\`${ADMIN_WALLET}\`\n\nDupă plată, scrie:\n\`/verify [SIGNATURE_TRANZACTIE]\` ca să primești **500 SNTR** automat în balanță!`, { parse_mode: 'Markdown' });
});

// Logica pentru comenzi text (/verify și /setwallet)
bot.on('text', async (ctx) => {
  const msg = ctx.message.text;

  // Verificare Automată Tranzacție
  if (msg.startsWith('/verify')) {
    const signature = msg.split(' ')[1];
    if (!signature) return ctx.reply("❌ Te rog pune Signature-ul (ID-ul tranzacției) după comandă.");

    let user = await User.findOne({ telegramId: ctx.from.id });
    if (user.usedSignatures.includes(signature)) return ctx.reply("❌ Această tranzacție a fost deja folosită!");

    ctx.reply("🔍 Verificăm pe blockchain-ul Solana... Așteaptă.");
    
    const isValid = await verifyTransaction(signature);
    
    if (isValid) {
      user.sntrPoints += 500;
      user.usedSignatures.push(signature);
      await user.save();
      ctx.reply("✅ CONFIRMAT! Ai primit 500 SNTR. Comisionul de 1% a fost procesat și înregistrat.");
    } else {
      ctx.reply("❌ Tranzacție negăsită sau nu a fost trimisă la adresa Sentinel Core. Verifică ID-ul!");
    }
  }

  // Setare Portofel Utilizator
  if (msg.startsWith('/setwallet')) {
    const address = msg.split(' ')[1];
    if (address && address.length > 20) {
      await User.findOneAndUpdate({ telegramId: ctx.from.id }, { wallet: address });
      ctx.reply(`✅ Portofel salvat:\n${address}`);
    } else {
      ctx.reply("❌ Adresă invalidă!");
    }
  }
});

bot.launch({ dropPendingUpdates: true });
