const { Telegraf } = require('telegraf');
const axios = require('axios');
const cheerio = require('cheerio');
const Groq = require('groq-sdk');
const mongoose = require('mongoose');

// --- CONFIGURARE SECRETE (DIN GITHUB SETTINGS) ---
const token = process.env.TELEGRAM_TOKEN;
const mongoUri = process.env.MONGODB_URI;
const groqKey = process.env.GROQ_API_KEY;

// Verificăm dacă token-ul există înainte să pornim, ca să nu dea eroarea 401
if (!token) {
    console.error("❌ EROARE: TELEGRAM_TOKEN nu este setat în Secrets!");
    process.exit(1);
}

const bot = new Telegraf(token);
const groq = new Groq({ apiKey: groqKey });

// --- CONECTARE BAZĂ DE DATE ---
if (mongoUri) {
    mongoose.connect(mongoUri)
      .then(() => console.log('✅ Sentinela s-a conectat la baza de date.'))
      .catch(err => console.error('❌ Eroare la baza de date:', err.message));
}

// --- FUNCȚIA DE VÂNĂTOARE (SCRAPER OLX) ---
async function scrapeOLX(query) {
    try {
        const searchUrl = `https://www.olx.ro/oferte/q-${query.replace(/\s+/g, '-')}/?search%5Border%5D=filter_float_price%3Aasc`;
        const { data } = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36' }
        });
        const $ = cheerio.load(data);
        let results = [];

        $('[data-cy="l-card"]').each((i, el) => {
            if (i < 5) { 
                const title = $(el).find('h6').text().trim();
                const price = $(el).find('[data-testid="ad-price"]').text().trim();
                const linkRaw = $(el).find('a').attr('href');
                const link = linkRaw.startsWith('http') ? linkRaw : "https://www.olx.ro" + linkRaw;
                if (title && price) results.push({ title, price, link });
            }
        });
        return results;
    } catch (e) {
        console.error("Eroare la căutarea pe OLX:", e.message);
        return null;
    }
}

// --- COMENZI BOT ---

// Comanda /start
bot.start((ctx) => ctx.reply('Sunt Sentinela. Zi-mi ce vrei să cauți pe OLX. Folosește /olx [produs]'));

// Comanda /olx [produs]
bot.command('olx', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (!query) return ctx.reply('⚠️ Scrie și ce cauți! Ex: /olx golf 4');

    ctx.reply(`🔍 Caut cele mai mici prețuri pentru: ${query}...`);
    const offers = await scrapeOLX(query);

    if (!offers || offers.length === 0) {
        return ctx.reply('❌ Nu am găsit nimic momentan. Încearcă mai târziu sau alt produs.');
    }

    let message = `🚀 **CAPTURI NOI PENTRU ${query.toUpperCase()}:**\n\n`;
    offers.forEach((o, i) => {
        message += `${i+1}. ${o.title}\n💰 Preț: ${o.price}\n🔗 [Deschide Oferta](${o.link})\n\n`;
    });

    ctx.replyWithMarkdown(message);
});

// Răspuns cu AI (Groq) pentru orice alt text
bot.on('text', async (ctx) => {
    if (ctx.message.text.startsWith('/')) return;
    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: `Ești Sentinela, un asistent tăios și realist. Răspunde-i scurt lui Broo: ${ctx.message.text}` }],
            model: "llama-3.3-70b-versatile",
        });
        ctx.reply(completion.choices[0].message.content);
    } catch (e) {
        ctx.reply("⚠️ Sunt online, dar creierul AI e obosit. Folosește /olx pentru vânătoare!");
    }
});

// --- LANSARE BOT ---
bot.launch()
    .then(() => console.log('🤖 Sentinela a pornit la vânătoare!'))
    .catch((err) => console.error('❌ Eroare la pornire:', err.message));

// Oprire sigură
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
