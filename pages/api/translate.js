// pages/api/translate.js
// Takes a raw article and returns full Spanish learning content via Claude
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { title, description, content, source } = req.body;
  if (!title) return res.status(400).json({ error: "No article provided" });

  const prompt = `You are a Spanish language educator. Take this news article and produce a complete Spanish learning package for an Irish secondary school student at B1-B2 level.

ORIGINAL ARTICLE:
Title: ${title}
Source: ${source}
Content: ${content || description}

Return ONLY valid JSON in exactly this structure, no other text:
{
  "headline": "compelling Spanish headline for this story",
  "intro": "one engaging sentence in Spanish summarising the story (max 25 words)",
  "body": "the full article rewritten in clear natural Spanish across 5 paragraphs, each separated by a blank line. Aim for 350-400 words. Use B1-B2 vocabulary — natural but accessible. Do NOT oversimplify.",
  "english": "faithful English translation of your Spanish body text, 5 paragraphs matching the Spanish",
  "level": "B1 or B2",
  "category": "one of: DEPORTE, CIENCIA, TECNOLOGÍA, MUNDO, CULTURA, ECONOMÍA",
  "categoryColor": "one of: #FF5533, #7B5EA7, #169B62, #1a7abf, #c45c00, #2a7a2a",
  "vocab": [
    { "word": "interesting Spanish word from the article", "translation": "English meaning", "example": "example sentence using this word in Spanish" },
    { "word": "...", "translation": "...", "example": "..." },
    { "word": "...", "translation": "...", "example": "..." },
    { "word": "...", "translation": "...", "example": "..." },
    { "word": "...", "translation": "...", "example": "..." },
    { "word": "...", "translation": "...", "example": "..." }
  ],
  "verb": {
    "infinitive": "one key verb from the article worth learning",
    "meaning": "English meaning(s)",
    "type": "e.g. regular -ar verb, or irregular -er verb",
    "relatedVerbs": ["related verb (meaning)", "related verb (meaning)"],
    "tip": "practical tip about using this verb in everyday Spanish",
    "tenses": {
      "presente": {
        "label": "Presente",
        "note": "describe any irregularities or say Regular in all forms",
        "rows": [
          { "pronoun": "yo", "form": "...", "irregular": false, "reason": "" },
          { "pronoun": "tú", "form": "...", "irregular": false, "reason": "" },
          { "pronoun": "él/ella", "form": "...", "irregular": false, "reason": "" },
          { "pronoun": "nosotros", "form": "...", "irregular": false, "reason": "" },
          { "pronoun": "vosotros", "form": "...", "irregular": false, "reason": "" },
          { "pronoun": "ellos", "form": "...", "irregular": false, "reason": "" }
        ],
        "example": "example sentence using this tense"
      },
      "indefinido": {
        "label": "Pretérito Indefinido",
        "note": "describe any irregularities or say Regular in all forms",
        "rows": [
          { "pronoun": "yo", "form": "...", "irregular": false, "reason": "" },
          { "pronoun": "tú", "form": "...", "irregular": false, "reason": "" },
          { "pronoun": "él/ella", "form": "...", "irregular": false, "reason": "" },
          { "pronoun": "nosotros", "form": "...", "irregular": false, "reason": "" },
          { "pronoun": "vosotros", "form": "...", "irregular": false, "reason": "" },
          { "pronoun": "ellos", "form": "...", "irregular": false, "reason": "" }
        ],
        "example": "example sentence using this tense"
      },
      "imperfecto": {
        "label": "Imperfecto",
        "note": "describe any irregularities or say Regular in all forms",
        "rows": [
          { "pronoun": "yo", "form": "...", "irregular": false, "reason": "" },
          { "pronoun": "tú", "form": "...", "irregular": false, "reason": "" },
          { "pronoun": "él/ella", "form": "...", "irregular": false, "reason": "" },
          { "pronoun": "nosotros", "form": "...", "irregular": false, "reason": "" },
          { "pronoun": "vosotros", "form": "...", "irregular": false, "reason": "" },
          { "pronoun": "ellos", "form": "...", "irregular": false, "reason": "" }
        ],
        "example": "example sentence using this tense"
      },
      "futuro": {
        "label": "Futuro",
        "note": "describe any irregularities or say Regular in all forms",
        "rows": [
          { "pronoun": "yo", "form": "...", "irregular": false, "reason": "" },
          { "pronoun": "tú", "form": "...", "irregular": false, "reason": "" },
          { "pronoun": "él/ella", "form": "...", "irregular": false, "reason": "" },
          { "pronoun": "nosotros", "form": "...", "irregular": false, "reason": "" },
          { "pronoun": "vosotros", "form": "...", "irregular": false, "reason": "" },
          { "pronoun": "ellos", "form": "...", "irregular": false, "reason": "" }
        ],
        "example": "example sentence using this tense"
      }
    }
  },
  "quiz": [
    { "type": "comprehension", "question": "question in Spanish about the article", "options": ["option A", "option B", "option C", "option D"], "answer": 0, "explanation": "explanation in English of why this is correct" },
    { "type": "vocab", "question": "sentence from article with one word replaced by _____", "options": ["word A", "word B", "word C", "word D"], "answer": 0, "explanation": "explanation of the vocab word" },
    { "type": "truefalse", "question": "statement about the article in Spanish", "options": ["Verdadero", "Falso"], "answer": 0, "explanation": "explanation in English" },
    { "type": "comprehension", "question": "another comprehension question in Spanish", "options": ["option A", "option B", "option C", "option D"], "answer": 0, "explanation": "explanation in English" },
    { "type": "comprehension", "question": "another comprehension question in Spanish", "options": ["option A", "option B", "option C", "option D"], "answer": 0, "explanation": "explanation in English" }
  ]
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
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Claude API error");

    const raw = data.content[0].text.trim();
    // Strip markdown fences if present
    const cleaned = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(cleaned);

    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
