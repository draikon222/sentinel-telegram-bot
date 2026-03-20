// ... (păstrează restul codului de sus până la mainMenu)

const mainMenu = Markup.keyboard([
  ['💰 Balanță', '🎁 Daily Reward'],
  ['🔗 Invită Prieteni', '💸 Trimite/Plătește SOL'], // Buton nou pentru bani reali
  ['💳 Setează Portofel', 'ℹ️ Ajutor']
]).resize();

// ADRESA TA UNDE VIN COMISIOANELE (SCHIMB-O CU A TA!)
const ADMIN_WALLET = "J5MxnGsFa79EeQS6kAMcGLTK3kXXvC39TjEhj7BkD6bk"; 

bot.hears('💸 Trimite/Plătește SOL', (ctx) => {
  ctx.reply(`💸 **SENTINEL PAY (1% Fee)**\n\nFolosește acest serviciu pentru a trimite SOL către orice adresă cu un comision de doar 1%.\n\n🎁 **BONUS:** Primești **500 SNTR** pentru fiecare tranzacție procesată!\n\n**Cum funcționează?**\nTrimite comanda: \`/pay [adresa_destinatar] [suma_sol]\` \nExemplu: \`/pay 7xW... 0.5\``, { parse_mode: 'Markdown' });
});

bot.on('text', async (ctx) => {
  const msg = ctx.message.text;

  // LOGICA PENTRU CALCUL PLĂȚI ȘI COMISION
  if (msg.toLowerCase().startsWith('/pay')) {
    const parts = msg.split(' ');
    if (parts.length < 3) return ctx.reply("❌ Format greșit! Folosește: `/pay ADRESA SUMA`", { parse_mode: 'Markdown' });

    const dest = parts[1];
    const amount = parseFloat(parts[2]);
    if (isNaN(amount) || amount <= 0) return ctx.reply("❌ Sumă invalidă!");

    const fee = amount * 0.01; // CALCUL COMISION 1%
    const total = amount + fee;

    return ctx.reply(`📊 **DETALII TRANZACȚIE**\n\n🔹 Destinatar: \`${dest}\` \n🔹 Sumă: \`${amount} SOL\` \n🔹 Comision Sentinel (1%): \`${fee.toFixed(4)} SOL\` \n\n⚠️ **TOTAL DE PLATĂ:** \`${total.toFixed(4)} SOL\` \n\nPentru a finaliza, trimite suma totală la adresa noastră de escrow:\n\`${ADMIN_WALLET}\` \n\nDupă plată, trimite ID-ul tranzacției (Signature) pentru confirmare și primirea bonusului de 500 SNTR!`, { parse_mode: 'Markdown' });
  }

  // ... (restul de handlere pentru /setwallet, Daily Reward, etc. rămân neschimbate)
});

// ... (bot.launch)
