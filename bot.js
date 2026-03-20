bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    if (text.length >= 32 && text.length <= 44 && !text.includes('/')) {
        // Obținem balanța înainte de a afișa token-ul
        const bal = await connection.getBalance(new PublicKey(MY_TREASURY));
        const solBalance = (bal / LAMPORTS_PER_SOL).toFixed(4);

        ctx.replyWithMarkdown(
            `🎯 **TOKEN DETECTAT**\n\`${text}\`\n\n` +
            `🏦 **SOLDUL TĂU:** \`${solBalance} SOL\`\n\n` + // Aici am adăugat soldul
            `Ce vrei să faci?`,
            Markup.inlineKeyboard([
                [Markup.button.callback('🛒 BUY 0.1 SOL', `buy_0.1_${text}`)],
                [Markup.button.callback('🛒 BUY 0.5 SOL', `buy_0.5_${text}`)],
                [Markup.button.callback('💰 VEZI PROFIT', 'check_balance')] // Buton de back
            ])
        );
    }
});
