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
        "https://script.googleusercontent.com/a/macros/idahostatesman.com/echo?user_content_key=AehSKLg6qRlCA8GdoBLYvmKoeXM0qlYHosu4SIR_c4wh-vaq0QmFR5NmKjbYZRpwmrWKBElxaDSU4jINes-MGv-qbN9m8U1XT5J24L-cFMaLRSSaKmP6lb3myd0euiBpj_HogFpxhUhwropUr3Xqf9K3zu6OUWPAGNPC9qGfHy8DOn9Q6aNjhu9et8D6xYshDQUTX1UWJADsFdwzWoM9CMAiOSeBiK2GNeA_jyEkx1eRIHDdBUAh9ejUi1BJfG2JBfNGdWqI9Awjybir_2yq-WFPLdUpsV0pYg0DO-U1muYtQmY50ODb5DqmPkLPh2Fqmw&lib=MrNG-yONKM4TLUAB2VieHRrV78Ddeyst8"
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
