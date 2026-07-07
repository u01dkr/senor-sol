// pages/api/define.js
// Returns a quick definition for a Spanish word in context
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { word, sentence } = req.body;
  if (!word) return res.status(400).json({ error: "No word provided" });

  const prompt = `A student is reading a Spanish article and tapped on the word "${word}".
The sentence it appears in is: "${sentence}"

Return ONLY valid JSON, no other text:
{
  "word": "${word}",
  "partOfSpeech": "noun / verb / adjective / adverb / etc",
  "definition": "clear English definition in 1 sentence, considering the context",
  "example": "a short natural Spanish example sentence using this word (different from the article)"
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Claude error");
    const raw = data.content[0].text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");
    res.status(200).json(JSON.parse(raw));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
