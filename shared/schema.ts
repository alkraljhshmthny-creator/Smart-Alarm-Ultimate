import { pgTable, text, serial, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const alarms = pgTable("alarms", {
  id: serial("id").primaryKey(),
  time: text("time").notNull(), // HH:MM format
  label: text("label"),
  isActive: boolean("is_active").default(true),
  days: jsonb("days").$type<string[]>().default([]), // ["Mon", "Tue"] etc
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  theme: text("theme").default("dark_space"), // dark_space, sunset, royal_gold
  language: text("language").default("en"), // en, ar
  isPro: boolean("is_pro").default(false),
});

export const insertAlarmSchema = createInsertSchema(alarms).omit({ id: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });

export type Alarm = typeof alarms.$inferSelect;
export type InsertAlarm = z.infer<typeof insertAlarmSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

export type CreateAlarmRequest = InsertAlarm;
export type UpdateAlarmRequest = Partial<InsertAlarm>;
export type UpdateSettingsRequest = Partial<InsertSettings>;
