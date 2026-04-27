export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, section } = req.body;

    const prompt = `
Generiraj jedno tehničko pitanje za inženjera:

Tema: ${text}
Kategorija: ${section}

Format:
{
  "question": "...",
  "options": ["A","B","C","D"],
  "correct": 0,
  "explanation": "..."
}
`;

    const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "llama3-8b-8192",
    messages: [{ role: "user", content: prompt }]
  })
});

    const data = await aiRes.json();

    const textResponse = data.choices[0].message.content;
    const clean = textResponse.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    res.status(200).json(parsed);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}