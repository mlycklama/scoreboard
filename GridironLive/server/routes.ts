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
        "https://script.googleusercontent.com/a/macros/idahostatesman.com/echo?user_content_key=AehSKLhVmP98gRml3OOgBzjmOpQ7Vm75rDOC_lQ2FMxNREPmzBqzmxZYonc1NnrmHmrng5ENr0YW4FoCqLbmVI65iKVR2sLBHtF6TZQoaDhhC92k75Xuwpy_M0WVIbUfM1Rw255QD2j8nfMYYmM1WmkFQN6smjYq0SVG84WOHTquYTgMyD08MBW79Zw7ohCk7_UjWKkbSENqbqlayILiiSr4x0q9Jr5aWMHIlZDTLlm4WRHCTAVB62F3i-a57_JUZ8BMBlTFABTn62Lsa4l5TvZ0HjEE0ALtBh00KlQYO6kUOTeuNIRasggGwjM8GthReA&lib=M31nNDai410zvYaHZ4Pp4gKaDfETvgIFd"
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
