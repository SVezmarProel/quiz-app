export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, section, sectionIcon } = req.body;

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "Missing GROQ_API_KEY" });
    }

    const prompt = `
Generiraj jedno pitanje višestrukog odabira na hrvatskom jeziku.

Tema: "${text}"
Kategorija: "${section}"

Zahtjevi:
- pitanje mora provjeriti praktično razumijevanje
- pitanje mora biti konkretno i tehničko
- 4 ponuđena odgovora
- samo jedan odgovor je točan
- correct mora biti indeks 0, 1, 2 ili 3
- explanation maksimalno 2 rečenice

Vrati isključivo JSON u ovom formatu:
{
  "question": "tekst pitanja",
  "options": ["opcija A", "opcija B", "opcija C", "opcija D"],
  "correct": 0,
  "explanation": "kratko objašnjenje"
}
`;

    const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "Odgovaraš isključivo validnim JSON-om. Bez markdowna."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });

    const data = await aiRes.json();

    if (!aiRes.ok) {
      return res.status(aiRes.status).json({
        error: "Groq API error",
        details: data
      });
    }

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({
        error: "Groq nije vratio sadržaj",
        details: data
      });
    }

    const parsed = JSON.parse(content);

    return res.status(200).json({
      ...parsed,
      section,
      sectionIcon
    });

  } catch (err) {
    return res.status(500).json({
      error: "Serverless function error",
      message: err.message
    });
  }
}