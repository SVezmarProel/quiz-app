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
  model: "llama-3.1-8b-instant",
  messages: [
    {
      role: "system",
      content: "Odgovaraš isključivo validnim JSON-om. Bez markdowna, bez objašnjenja izvan JSON-a."
    },
    {
      role: "user",
      content: prompt
    }
  ],
  temperature: 0.2,
  response_format: { type: "json_object" }
})

    const data = await aiRes.json();

    const textResponse = data.choices[0].message.content;
    const clean = textResponse.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    res.status(200).json(parsed);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}