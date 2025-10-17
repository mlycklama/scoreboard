import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Simple in-memory cache
let cachedData: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30 * 1000; // 30 seconds

export async function registerRoutes(app: Express): Promise<Server> {
  // Proxy endpoint to fetch games data from external API with caching
  app.get("/api/games", async (req, res) => {
    try {
      const now = Date.now();
      const forceRefresh = req.query.refresh === 'true';
      
      // Return cached data if it's still valid and not a forced refresh
      if (!forceRefresh && cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
        res.json(cachedData);
        return;
      }
      
      // Fetch fresh data
      const response = await fetch(
        "https://script.googleusercontent.com/a/macros/idahostatesman.com/echo?user_content_key=AehSKLgV5dbGiCQdIk9G63gz7MkOhtugoL19S1IBZd9IUh491Y_eD9_x0Td4BohdHalP6otcqwQF9FZZFdRwp89RDly3BbDuQUwgmNikwZalChvz7plqG0NMWzqfzYUe52c2_CBem2sEaFqJ08NbRIqGvi2lWuux9HesNn54S_gQeq9AlARk7hq9WOfx21zu-sq8Pxfwhg1gOGdzgrEDKhmBuXrwRiTK2AYj1_b_O_Edc3QP-IyLXg6gDVwZmVF6TkXkGQBvz0ugjrBsV6Dsa56ich7C_7WHEIe-uEBIgqv15pYSSZAJOObSte54I4P75g&lib=MrNG-yONKM4TLUAB2VieHRrV78Ddeyst8"
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update cache
      cachedData = data;
      cacheTimestamp = now;
      
      res.json(data);
    } catch (error) {
      console.error("Error fetching games:", error);
      
      // Return cached data if available during error
      if (cachedData) {
        console.log("Returning cached data due to fetch error");
        res.json(cachedData);
        return;
      }
      
      res.status(500).json({ 
        message: "Failed to fetch games data", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
