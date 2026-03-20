// Comanda pentru setarea portofelului
bot.command('setwallet', async (ctx) => {
  const address = ctx.message.text.split(' ')[1]; // Luăm ce scrie după comandă
  
  if (!address || address.length < 32) {
    return ctx.reply("❌ Eroare: Te rugăm să pui o adresă validă de Solana.\nExemplu: /setwallet ADRESA_TA");
  }

  try {
    await User.findOneAndUpdate(
      { telegramId: ctx.from.id },
      { wallet: address },
      { upsert: true }
    );
    ctx.reply(`✅ Portofel setat cu succes!\nAdresa: ${address}`);
  } catch (e) {
    console.log("Wallet Error:", e);
    ctx.reply("❌ Eroare la salvarea portofelului.");
  }
});
