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
        "https://script.googleusercontent.com/a/macros/idahostatesman.com/echo?user_content_key=AehSKLgBUOBO2p0MqRCP-7ttJ466rVqceFbdmCJ3iZbubVrR53oGlwA2wozJfY1dOjQo4kUmTyoAFWrmusGoph2IGg7khK0aRi-oa3MPxEJLkEbME60QR4G4_9241ZiqksqutWEZNZEscg1PVcFE3cGfcWgMwC_OswsYRNYwNUHJtvMZ0V_MjQakvaa0ESR5gzjC98SKofq3NCQuXUEZjTuULX3gKI7XR6F3_NECTEYeS4g7Oonj90O_xaImp5rzX0jlyHEfVZwJUHzv2vvFnat6KceXyP0qKleUVDzOGG36Gp7LPNsOpuPcx4Kffez2dQ&lib=MrNG-yONKM4TLUAB2VieHRrV78Ddeyst8"
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
