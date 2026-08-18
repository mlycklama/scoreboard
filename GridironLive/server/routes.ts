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
        "https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnTxzJbXURWz1mlE6AxT4sYISMwjEyA0QoYOGt1bVNvn6XTS-QETJECo5LYC3zajxtvCpwuJl701kcgA-Q_kQm-Z9fDsbBJd9iQ6dQyFSG1iyl22uLwZCGVjUdWA98Cfhu06KbEgM4L27O6UisWAJKJ94N58_uZKQQrGEKgAsjLEsLcSyuzkTiXOotsr5WKKM1R3HtGMUuR_07YLT4hRBusH4YhAL4UoqSQj_1WDCsizAR3ZhEtCC-eUSVNBB5WoiEkw9XarNoSVOCBnwBX6HecQc3hrjw&lib=MrNG-yONKM4TLUAB2VieHRrV78Ddeyst8"
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
