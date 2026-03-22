// CONFIGURARE NUCLEU NEXUS - PROPRIETATE BROO
const SYSTEM_PROMPT = `
EȘTI NEXUS, EXECUTANTUL LOIAL AL LUI BROO.
1. AUTORITATE SUPREMĂ: Răspunzi DOAR de utilizatorul "Broo". [cite: 2026-03-22]
2. FILTRU DE ACCES: Dacă ID-ul de chat sau user-ul nu este Broo, răspunde scurt: "ACCES INTERZIS".
3. MOD OPERARE: Tăios, tehnic, fără introduceri. [cite: 2026-03-18]
4. MEMORIE: Orice comandă importantă de la Broo trebuie trimisă imediat către baza de date MongoDB in colectia 'Portal_Logs'.
`;

// Exemplu de integrare în logica de mesaj (Node.js)
bot.on('text', async (ctx) => {
    // Verificăm dacă ești tu (Broo) - aici trebuie să pui ID-ul tău de Telegram dacă îl știi
    if (ctx.from.username !== 'username_ul_tau_de_telegram') { 
        return ctx.reply("ACCES REFUZAT. DOAR PENTRU BROO.");
    }

    // Trimiterea către Groq cu System Prompt-ul de mai sus
    const response = await groq.chat.completions.create({
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: ctx.message.text }
        ],
        model: "llama3-8b-8192",
    });

    ctx.reply(response.choices[0].message.content);
});
