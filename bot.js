// ... (păstrează restul codului de sus)

// FUNCȚIA NOUĂ: Ascultă când trimiți un CA manual
bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    
    // Verificăm dacă textul seamănă cu o adresă de Solana (44 caractere)
    if (text.length >= 32 && text.length <= 44) {
        ctx.replyWithMarkdown(
            `🎯 **TOKEN DETECTAT**\n\`${text}\`\n\nCe vrei să faci?`,
            Markup.inlineKeyboard([
                [Markup.button.callback('🛒 BUY 0.1 SOL', `buy_0.1_${text}`)],
                [Markup.button.callback('🛒 BUY 0.5 SOL', `buy_0.5_${text}`)],
                [Markup.button.url('📊 Chart', `https://dexscreener.com/solana/${text}`)]
            ])
        );
    } else if (!text.startsWith('/')) {
        ctx.reply("❌ Trimite o adresă de contract (CA) validă.");
    }
});

// Handler pentru butoanele de BUY (Să nu dea eroare când apeși pe ele)
bot.action(/buy_(.*)_(.*)/, (ctx) => {
    const amount = ctx.match[1];
    const ca = ctx.match[2];
    ctx.answerCbQuery();
    ctx.reply(`🚀 Se procesează achiziția de ${amount} SOL pentru: \n\`${ca}\`\n\n(Aici legăm portofelul în pasul următor)`);
});

bot.launch();
