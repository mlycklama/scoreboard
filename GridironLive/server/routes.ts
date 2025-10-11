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
        "https://script.googleusercontent.com/a/macros/idahostatesman.com/echo?user_content_key=AehSKLhk8VRYn3UM2Aon-TC7eFdqihB3NUO16t3GWFxreEUb-0bb8t7bYwT0svYvT1C2hhDR9sJ6H-D43ypcXFDhKVzs5jAJPcZLwGztb-nTlKdICW5ILY1WHDS1T3EO77SnL5m9XZQziwzCZcbuTeWzB2o2EaP7RA1oixeUG0pm9rWzy8kJrcs-ZT4NzGjaGu3235HVPTkd5CoZ1w-s7TtdVtSxDzFSm1wjkf9b74t2fcXYYZSDss3rspyPbqfsqmdBSPeNHORbjgejz0Z5_LzO5mLWl36U_gf5pdbgDv8cUeI9_XOoh_MM2Gt6siozxg&lib=MrNG-yONKM4TLUAB2VieHRrV78Ddeyst8"
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
