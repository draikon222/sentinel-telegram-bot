const { Telegraf, Markup } = require('telegraf');
const mongoose = require('mongoose');
const { Connection, clusterApiUrl } = require('@solana/web3.js');
const http = require('http');

const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Sentinel Core is Alive');
}).listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SERVER ACTIV PE PORTUL ${PORT}`);
});

const solanaConn = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://draikon:Gioniluca1980@cluster0.zc3ggbq.mongodb.net/?appName=Cluster0")
  .then(() => console.log("✅ DB CONECTAT"))
  .catch(err => console.error("❌ EROARE DB:", err));

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
const ADMIN_WALLET = "J5MxnGsFa79EeQS6kAMcGLTK3kXXvC39TjEhj7BkD6bk"; 

const mainMenu = Markup.keyboard([
  ['💰 Balanță', '🎁 Daily Reward'],
  ['🔗 Invită Prieteni', '💸 Trimite/Plătește SOL'],
  ['🏆 Top 10', '💳 Setează Portofel']
]).resize();

async function verifyTransaction(signature) {
  try {
    const tx = await solanaConn.getTransaction(signature, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 });
    if (!tx) return false;
    const accountKeys = tx.transaction.message.staticAccountKeys ? 
                        tx.transaction.message.staticAccountKeys.map(k => k.toString()) :
                        tx.transaction.message.accountKeys.map(k => k.toString());
    return accountKeys.includes(ADMIN_WALLET);
  } catch (e) { return false; }
}

bot.start(async (ctx) => {
  let user = await User.findOne({ telegramId: ctx.from.id });
  if (!user) {
    user = new User({ telegramId: ctx.from.id, username: ctx.from.username || 'Anonim' });
    await user.save();
  }
  ctx.reply("🛡️ SENTINEL CORE ACTIV.", mainMenu);
});

// --- REPARAREA BUTOANELOR ---

bot.hears('💰 Balanță', async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  ctx.reply(`📊 STATUS:\n💰 SNTR: ${user?.sntrPoints || 0}\n💳 Portofel: ${user?.wallet || 'Nespecificat'}`);
});

bot.hears('🎁 Daily Reward', async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  const now = new Date();
  if (now - user.lastDaily < 86400000) return ctx.reply("⏳ Revino mâine!");
  user.sntrPoints += 20;
  user.lastDaily = now;
  await user.save();
  ctx.reply("✅ Ai primit 20 SNTR!");
});

bot.hears('🔗 Invită Prieteni', (ctx) => {
  ctx.reply(`🚀 Link: https://t.me/SentinelCoreV1_bot?start=${ctx.from.id}`);
});

bot.hears('💸 Trimite/Plătește SOL', (ctx) => {
  ctx.reply(`💸 Trimite SOL la:\n\`${ADMIN_WALLET}\`\n\nVerifică cu: \`/verify ID\``, { parse_mode: 'Markdown' });
});

// REPARAT: Handler pentru Top 10
bot.hears('🏆 Top 10', async (ctx) => {
  const topUsers = await User.find().sort({ sntrPoints: -1 }).limit(10);
  let msg = "🏆 **TOP 10 UTILIZATORI**\n\n";
  topUsers.forEach((u, i) => {
    msg += `${i + 1}. @${u.username || 'Anonim'} - ${u.sntrPoints} SNTR\n`;
  });
  ctx.reply(msg, { parse_mode: 'Markdown' });
});

// REPARAT: Handler pentru Setează Portofel
bot.hears('💳 Setează Portofel', (ctx) => {
  ctx.reply("💳 Trimite comanda sub forma:\n`/setwallet ADRESA_TA_SOLANA`", { parse_mode: 'Markdown' });
});

bot.on('text', async (ctx) => {
  const msg = ctx.message.text;
  if (msg.startsWith('/verify')) {
    const sig = msg.split(' ')[1];
    if (!sig) return ctx.reply("❌ Pune ID-ul!");
    ctx.reply("🔍 Verificăm...");
    const ok = await verifyTransaction(sig);
    if (ok) {
      await User.findOneAndUpdate({ telegramId: ctx.from.id }, { $inc: { sntrPoints: 500 } });
      ctx.reply("✅ Confirmat! +500 SNTR");
    } else { ctx.reply("❌ Invalid."); }
  }
  
  if (msg.startsWith('/setwallet')) {
    const addr = msg.split(' ')[1];
    if (addr) {
      await User.findOneAndUpdate({ telegramId: ctx.from.id }, { wallet: addr });
      ctx.reply("✅ Portofel salvat!");
    }
  }
});

bot.launch();
