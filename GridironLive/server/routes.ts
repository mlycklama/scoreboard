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
    "https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnRaAjy4E-PyAOMg9bfcNopB5BkSuVqzc3T8mkI0vF5qhso69IRTAiFj9smd--9OZR7atqPocM7iTyjUSaRxmeGg5dz2wPQzq_dT1quRPaos7RXCXsoA3Zd6GZmsiyC7YSx5TD2QNvjjKz4D9oK0SAcBz8TVq_g1fkDmsKtilMC3lQk8nvOVFy6OGqLKL4gYRTFxck8kdPwEfRTmxzxApNbqjJcfDRh4sKqj8jU2aDgC4HUAp3g6PVANki4qJEhL27ObXg_RqK29nM5DgvrL90zpnByuNA&lib=MrNG-yONKM4TLUAB2VieHRrV78Ddeyst8",
    {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    }
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
