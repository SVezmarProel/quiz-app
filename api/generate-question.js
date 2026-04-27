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

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
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