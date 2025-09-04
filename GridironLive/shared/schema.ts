import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Game schema for football scoreboard
export const gameSchema = z.object({
  Date: z.string(),
  Away: z.string(),
  AScore: z.number().nullable(),
  Home: z.string(),
  HScore: z.number().nullable(),
  Time: z.string(),
  Details: z.string(),
});

export type Game = z.infer<typeof gameSchema>;

export const gamesResponseSchema = z.object({
  data: z.array(gameSchema),
});

export type GamesResponse = z.infer<typeof gamesResponseSchema>;
