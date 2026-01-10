import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Alarms
  app.get(api.alarms.list.path, async (req, res) => {
    const alarms = await storage.getAlarms();
    res.json(alarms);
  });

  app.post(api.alarms.create.path, async (req, res) => {
    try {
      const input = api.alarms.create.input.parse(req.body);
      const alarm = await storage.createAlarm(input);
      res.status(201).json(alarm);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.message });
        return;
      }
      throw err;
    }
  });

  app.put(api.alarms.update.path, async (req, res) => {
    try {
      const input = api.alarms.update.input.parse(req.body);
      const alarm = await storage.updateAlarm(Number(req.params.id), input);
      res.json(alarm);
    } catch (err) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  app.delete(api.alarms.delete.path, async (req, res) => {
    await storage.deleteAlarm(Number(req.params.id));
    res.status(204).end();
  });

  // Settings
  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.patch(api.settings.update.path, async (req, res) => {
    const input = api.settings.update.input.parse(req.body);
    const settings = await storage.updateSettings(input);
    res.json(settings);
  });

  // Seed Data
  const existingAlarms = await storage.getAlarms();
  if (existingAlarms.length === 0) {
    await storage.createAlarm({ time: "07:00", label: "Morning Wake Up", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] });
    await storage.createAlarm({ time: "08:30", label: "Weekend Sleep In", days: ["Sat", "Sun"] });
  }

  return httpServer;
}
