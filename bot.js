const { Telegraf } = require('telegraf');
const axios = require('axios');
const cheerio = require('cheerio');
const Groq = require('groq-sdk');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// SCRAPER SIMPLU - Doar titlu și preț
async function getOLX(query) {
    try {
        const url = `https://www.olx.ro/oferte/q-${query.replace(/\s+/g, '-')}/`;
        const { data } = await axios.get(url, { 
            timeout: 8000,
            headers: { 'User-Agent': 'Mozilla/5.0' } 
        });
        const $ = cheerio.load(data);
        let items = [];
        $('[data-cy="l-card"]').each((i, el) => {
            if (i < 3) {
                const t = $(el).find('h6').text().trim();
                const p = $(el).find('[data-testid="ad-price"]').text().trim();
                if (t && p) items.push(`🔹 ${t} - **${p}**`);
            }
        });
        return items.length > 0 ? items.join('\n') : "Nimic găsit.";
    } catch (e) {
        return "OLX a blocat cererea. Reîncearcă mai târziu.";
    }
}

bot.command('olx', async (ctx) => {
    const text = ctx.message.text.split(' ').slice(1).join(' ');
    if (!text) return ctx.reply("Zi-mi ce să caut!");
    ctx.reply("🔍 Caut...");
    const res = await getOLX(text);
    ctx.reply(res, { parse_mode: 'Markdown' });
});

bot.on('text', async (ctx) => {
    try {
        const chat = await groq.chat.completions.create({
            messages: [{ role: "user", content: ctx.message.text }],
            model: "llama-3.3-70b-versatile",
        });
        ctx.reply(chat.choices[0].message.content);
    } catch (e) {
        ctx.reply("AI-ul e offline, dar /olx ar trebui să meargă.");
    }
});

bot.launch();
