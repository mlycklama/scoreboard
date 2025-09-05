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
        "https://script.googleusercontent.com/a/macros/idahostatesman.com/echo?user_content_key=AehSKLhVxGyRR-hys4Yvx7kzXDeyEDE6wN9wRnTQQRALsB8PE6yLkO4HEuMADAF6s8bbYDEnuyFzlqGVsclgai65JIPTt2lG4-7OjKmsFwVbpyuCCbGRIY6OtOPC2oFAsNXL8tEe1_7At93v5TbJC716YGUFaHfeo1UZ8sq8sWPrziLyC9DVxOSMmTceNGKMizU98xS08Jy9kpUL_RofeqY4mq4euWo-krFJemapi4gP-SrF21KOClqRWhgLFK8-wNEfAr9wmBnfvUyjC8At5EqqcBSJMKSn9PF2OZ01sigNhJXYPHdvGHTttsBbo5hz2g&lib=MrNG-yONKM4TLUAB2VieHRrV78Ddeyst8"
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
