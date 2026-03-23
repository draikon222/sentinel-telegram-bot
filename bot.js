const { Telegraf } = require('telegraf');
const axios = require('axios');
const cheerio = require('cheerio');
const Groq = require('groq-sdk');
const mongoose = require('mongoose');

const token = process.env.TELEGRAM_TOKEN;
const mongoUri = process.env.MONGODB_URI;
const groqKey = process.env.GROQ_API_KEY;

if (!token) { process.exit(1); }

const bot = new Telegraf(token);
const groq = new Groq({ apiKey: groqKey });

if (mongoUri) {
    mongoose.connect(mongoUri).catch(err => console.error('DB Error:', err.message));
}

// SCRAPER SIMPLIFICAT ȘI MAI REZISTENT
async function scrapeOLX(query) {
    try {
        const searchUrl = `https://www.olx.ro/oferte/q-${query.replace(/\s+/g, '-')}/?search%5Border%5D=filter_float_price%3Aasc`;
        const { data } = await axios.get(searchUrl, {
            timeout: 5000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/110.0.0.0' }
        });
        const $ = cheerio.load(data);
        let results = [];

        $('[data-cy="l-card"]').each((i, el) => {
            if (i < 3) { // Luăm doar primele 3, să fim rapizi
                const title = $(el).find('h6').text().trim();
                const price = $(el).find('[data-testid="ad-price"]').text().trim();
                const link = $(el).find('a').attr('href');
                if (title && price) results.push({ title, price, link: link.startsWith('http') ? link : "https://www.olx.ro" + link });
            }
        });
        return results;
    } catch (e) {
        return null;
    }
}

bot.command('olx', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (!query) return ctx.reply('⚠️ Ce cauți? Ex: /olx golf');

    try {
        const offers = await scrapeOLX(query);
        if (!offers || offers.length === 0) return ctx.reply('❌ Nimic găsit acum. OLX ne cam blochează.');

        let msg = `🚀 **CAPTURI PENTRU ${query.toUpperCase()}:**\n\n`;
        offers.forEach(o => msg += `🔹 ${o.title}\n💰 ${o.price}\n🔗 ${o.link}\n\n`);
        ctx.reply(msg);
    } catch (err) {
        ctx.reply('⚠️ Eroare tehnică. Mai încearcă o dată.');
    }
});

bot.on('text', async (ctx) => {
    if (ctx.message.text.startsWith('/')) return;
    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: `Răspunde-i scurt și tăios lui Broo: ${ctx.message.text}` }],
            model: "llama-3.3-70b-versatile",
        });
        ctx.reply(completion.choices[0].message.content);
    } catch (e) {
        ctx.reply("Sunt online. Folosește /olx.");
    }
});

bot.launch();

