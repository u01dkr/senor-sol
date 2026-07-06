// pages/api/news.js
// Fetches articles from NewsAPI — mix of Spanish and English sources
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const key = process.env.NEWS_API_KEY;
  if (!key) return res.status(500).json({ error: "NEWS_API_KEY not set" });

  // Mix of Spanish-language and English-language sources
  const sources = [
    "el-mundo,el-pais-english,bbc-news,the-guardian-uk,reuters"
  ].join(",");

  try {
    const url = `https://newsapi.org/v2/top-headlines?sources=${sources}&pageSize=12&apiKey=${key}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "ok") {
      return res.status(500).json({ error: data.message || "NewsAPI error" });
    }

    // Return just what we need
    const articles = (data.articles || [])
      .filter(a => a.title && a.description && a.title !== "[Removed]")
      .slice(0, 10)
      .map(a => ({
        id: Buffer.from(a.url).toString("base64").slice(0, 12),
        title: a.title,
        description: a.description,
        content: a.content || a.description,
        source: a.source?.name || "Unknown",
        url: a.url,
        publishedAt: a.publishedAt,
      }));

    res.status(200).json({ articles });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
