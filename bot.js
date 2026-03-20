const { Telegraf, Markup } = require('telegraf');
const mongoose = require('mongoose');
const { Connection, clusterApiUrl } = require('@solana/web3.js');
const http = require('http');

// 1. FORȚĂM SERVERUL SĂ RĂSPUNDĂ (FIX PENTRU RENDER)
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Sentinel Core Online');
}).listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server activ pe portul ${PORT}`);
});

// 2. CONEXIUNE BLOCKCHAIN & DB
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

// 3. MENIUL (Trebuie să fie identic cu textul din bot.hears)
const mainMenu = Markup.keyboard([
  ['💰 Balanță', '🎁 Daily Reward'],
  ['🔗 Invită Prieteni', '💸 Trimite/Plătește SOL'],
  ['🏆 Top 10', '💳 Setează Portofel']
]).resize();

// 4. HANDLERS PENTRU BUTOANE (REPARATE)
bot.start(async (ctx) => {
  let user = await User.findOne({ telegramId: ctx.from.id });
  if (!user) {
    user = new User({ telegramId: ctx.from.id, username: ctx.from.username || 'Anonim' });
    await user.save();
  }
  ctx.reply("🛡️ SENTINEL CORE ACTIV. SISTEM REPORNIT.", mainMenu);
});

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

bot.hears('🏆 Top 10', async (ctx) => {
  const topUsers = await User.find().sort({ sntrPoints: -1 }).limit(10);
  let msg = "🏆 **TOP 10 UTILIZATORI**\n\n";
  topUsers.forEach((u, i) => { msg += `${i + 1}. @${u.username || 'Anonim'} - ${u.sntrPoints} SNTR\n`; });
  ctx.reply(msg, { parse_mode: 'Markdown' });
});

bot.hears('🔗 Invită Prieteni', (ctx) => {
  ctx.reply(`🚀 Link-ul tău:\nhttps://t.me/SentinelCoreV1_bot?start=${ctx.from.id}`);
});

bot.hears('💸 Trimite/Plătește SOL', (ctx) => {
  ctx.reply(`💸 Trimite SOL la:\n\`${ADMIN_WALLET}\`\n\nVerifică cu: \`/verify ID\``, { parse_mode: 'Markdown' });
});

bot.hears('💳 Setează Portofel', (ctx) => {
  ctx.reply("💳 Scrie: `/setwallet ADRESA_TA`", { parse_mode: 'Markdown' });
});

// 5. COMENZI TEXT
bot.on('text', async (ctx) => {
  const msg = ctx.message.text;
  if (msg.startsWith('/verify')) {
    const sig = msg.split(' ')[1];
    if (!sig) return ctx.reply("❌ Pune ID-ul tranzacției!");
    ctx.reply("🔍 Verificăm...");
    // Verificarea aici...
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
