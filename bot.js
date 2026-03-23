const { Telegraf } = require('telegraf');
const { chromium } = require('playwright');
// ... restul importurilor

bot.command('screenshot', async (ctx) => {
    let browser;
    try {
        // Nexus nu doar scrie, Nexus configurează
        browser = await chromium.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        const page = await browser.newPage();
        await page.goto(ctx.message.text.split(' ')[1] || 'https://google.com');
        const buffer = await page.screenshot();
        await ctx.replyWithPhoto({ source: buffer });
    } catch (e) {
        // Aici apare eroarea ta din poza 12228.jpg
        ctx.reply("❌ EROARE CRITICĂ: Browserul nu este instalat pe serverul Render.");
        console.log("RULEAZĂ: npx playwright install chromium");
    } finally {
        if (browser) await browser.close();
    }
});
