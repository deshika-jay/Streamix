import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy route for TMDB Movie Details by TMDB ID
  app.get("/api/tmdb/movie/:id", async (req, res) => {
    const tmdbId = req.params.id;
    const tmdbApiKey = process.env.TMDB_API_KEY;
    
    if (!tmdbApiKey || tmdbApiKey === "your_tmdb_api_key_here") {
      return res.status(500).json({ error: "TMDB_API_KEY is not configured in secrets." });
    }

    try {
      // Fetch from TMDB
      const response = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${tmdbApiKey}`);
      if (!response.ok) {
        throw new Error(`TMDB responded with status ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching TMDB data:", error);
      res.status(500).json({ error: "Failed to fetch from TMDB" });
    }
  });

  // Proxy route for TMDB searching
  app.get("/api/tmdb/search", async (req, res) => {
    const query = req.query.q;
    const tmdbApiKey = process.env.TMDB_API_KEY;
    
    if (!tmdbApiKey || tmdbApiKey === "your_tmdb_api_key_here") {
      return res.status(500).json({ error: "TMDB_API_KEY is not configured in secrets." });
    }

    try {
      const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(query as string)}`);
      if (!response.ok) {
        throw new Error(`TMDB responded with status ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error searching TMDB data:", error);
      res.status(500).json({ error: "Failed to search TMDB" });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
