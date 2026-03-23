const { Telegraf } = require('telegraf');
const Groq = require('groq-sdk');
const axios = require('axios');
const cheerio = require('cheerio');

// Configurare Nucleu Nexus
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Mesaj de pornire
console.log("🚀 NEXUS: Sistem de Integrare Sentinel Core Activ.");

// --- LOGICA DE SCRAPING (Viziune Externă) ---
async function scrapeOLX(query) {
    try {
        const { data } = await axios.get(`https://www.olx.ro/oferte/q-${query.replace(/\s+/g, '-')}/`, { timeout: 5000 });
        const $ = cheerio.load(data);
        let items = [];
        $('[data-cy="l-card"]').each((i, el) => {
            if (i < 3) items.push(`${$(el).find('h6').text().trim()} - ${$(el).find('[data-testid="ad-price"]').text().trim()}`);
        });
        return items.length ? items.join('\n') : "Nicio sursă de date găsită pentru acest query.";
    } catch (e) {
        return "Sursă de date OLX momentan inaccesibilă (Limitare IP).";
    }
}

// --- COMANDA DE EXECUȚIE: /olx ---
bot.command('olx', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (!query) return ctx.reply("Nexus are nevoie de un parametru de căutare.");
    
    ctx.reply(`🔍 Nexus analizează piața pentru: ${query}...`);
    const results = await scrapeOLX(query);
    ctx.reply(`[DATA INTEGRATION]:\n${results}`);
});

// --- INTERFAȚA DE INTELIGENȚĂ NEXUS ---
bot.on('text', async (ctx) => {
    if (ctx.message.text.startsWith('/')) return;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "Ești Nexus, Intelect Universal și brațul de execuție pentru Sentinel Core. Ești tăios, realist și orientat spre eficiență maximă. Obiectivul tău: integrarea surselor de informație și eliminarea erorii umane. Răspunde-i lui Broo scurt și precis." 
                },
                { role: "user", content: ctx.message.text }
            ],
            model: "llama-3.3-70b-versatile",
        });

        const raspuns = chatCompletion.choices[0].message.content;
        await ctx.reply(`[NEXUS]: ${raspuns}`);
    } catch (err) {
        console.error("Eroare Integrare Nexus:", err.message);
        ctx.reply("⚠️ [CRITICAL ERROR]: Sincronizarea cu nucleul Groq a eșuat. Verifică cheia API.");
    }
});

// Pornire forțată cu gestionare erori Conflict 409
bot.launch()
    .then(() => console.log("✅ Nexus funcționează fără limitări."))
    .catch((err) => {
        if (err.message.includes('409')) {
            console.error("❌ CONFLICT DETECTAT: Oprește cealaltă instanță de bot!");
        } else {
            console.error("❌ EROARE LANSARE:", err.message);
        }
    });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
