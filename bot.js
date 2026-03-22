const { Telegraf } = require('telegraf');
const axios = require('axios');
const cheerio = require('cheerio');
const Groq = require('groq-sdk');
const mongoose = require('mongoose');

// GitHub Actions citește secretele direct din Environment
const token = process.env.TELEGRAM_TOKEN;
const mongoUri = process.env.MONGODB_URI;
const groqKey = process.env.GROQ_API_KEY;

if (!token) {
    console.error("❌ EROARE: TELEGRAM_TOKEN lipsește!");
    process.exit(1);
}

const bot = new Telegraf(token);
const groq = new Groq({ apiKey: groqKey });

mongoose.connect(mongoUri)
  .then(() => console.log('✅ Bază de date conectată!'))
  .catch(err => console.error('❌ Eroare DB:', err));

// Comanda OLX
bot.command('olx', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (!query) return ctx.reply('⚠️ Ce să caut? Ex: /olx golf 4');
    ctx.reply(`🔍 Vânez prețuri pentru: ${query}...`);
    // ... restul logicii de scraping ...
    ctx.reply("Sistemul de vânătoare e activ!");
});

bot.on('text', (ctx) => ctx.reply("Sentinela e activă! Folosește /olx [produs]"));

bot.launch().then(() => console.log('🤖 Sentinela e ONLINE!'));

// Oprire grațioasă
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
