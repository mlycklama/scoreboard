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
        "https://script.googleusercontent.com/a/macros/idahostatesman.com/echo?user_content_key=AehSKLgrnngr-zYxP22LKMEmvLTd_CG8O0BCsF8od5JKAIcSruxdgVfs_lA64Y8srYB-xm0Pwm4Vh_dJ-0RNHFfCT6aSDwoOETwQ9sUFLsM7wehNj2fU8SdxEzbvYcQLvplWJAFY1KCxhx5oCc5b1If0EvzYUp00NkqCiWwyZ2D3GpALxZoTjhlA2EQiGfz8fyZNDCRRoamNa3xD6oahxCrKYkSWrUV-hW5Vgm06CfwMxtITWl31llBJR2iCIO4SwqLgzPwrvBL0snL3PsanVVC3DGXmaBRwaMcJDLqt8Dw5rPX3oyjAvt5IgstpRossmQ&lib=MrNG-yONKM4TLUAB2VieHRrV78Ddeyst8"
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
