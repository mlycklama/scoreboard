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
        "https://script.googleusercontent.com/a/macros/idahostatesman.com/echo?user_content_key=AehSKLg9_J3ov6ipPehQ7Ujft7eZn8gW3pxvQy7HErmOQv20x67QKspwUlQ5919btjGMUw2g4Hy54zAqIIUuTwKA_dGrp_4mkmnZ_uvyISibPsWs8f4yUUQVkY1M_hRrdDckhD-jAaU3ODwWibdbr6cNM3Je0ABX6ODXVy-3AABtYF5wSk_iCYoIkmEiXwo-c3v6GJI-GQZhY5HCciJb37SEbjJm8v4BwRFCZk4JmFItKFAVHX-fL46YxZMT1X8m-G_q3h56Na7vrzVlKpmVElrVrAqD6tXjMpkXii3LUYGtJK1BafYBKn1Sq9fnT0KHAg&lib=MrNG-yONKM4TLUAB2VieHRrV78Ddeyst8"
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
