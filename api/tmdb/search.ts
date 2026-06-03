import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const query = req.query.q;
  const tmdbApiKey = process.env.TMDB_API_KEY;
  
  if (!tmdbApiKey || tmdbApiKey === "your_tmdb_api_key_here") {
    return res.status(500).json({ error: "TMDB_API_KEY is not configured in secrets." });
  }

  if (!query) {
    return res.status(400).json({ error: "Query parameter 'q' is required." });
  }

  try {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(query as string)}`);
    if (!response.ok) {
      throw new Error(`TMDB responded with status ${response.status}`);
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error searching TMDB data:", error);
    return res.status(500).json({ error: "Failed to search TMDB" });
  }
}
