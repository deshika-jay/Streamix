import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // URL එකෙන් ID එක ගන්නා ක්‍රමය (Vercel query එකක් ලෙස ගනී)
  const tmdbId = req.query.id;
  const tmdbApiKey = process.env.TMDB_API_KEY;
  
  if (!tmdbApiKey || tmdbApiKey === "your_tmdb_api_key_here") {
    return res.status(500).json({ error: "TMDB_API_KEY is not configured in secrets." });
  }

  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${tmdbApiKey}`);
    if (!response.ok) {
      throw new Error(`TMDB responded with status ${response.status}`);
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching TMDB data:", error);
    return res.status(500).json({ error: "Failed to fetch from TMDB" });
  }
}
