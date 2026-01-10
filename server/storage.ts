import { db } from "./db";
import {
  alarms,
  settings,
  type Alarm,
  type InsertAlarm,
  type Settings,
  type InsertSettings,
  type UpdateSettingsRequest
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getAlarms(): Promise<Alarm[]>;
  createAlarm(alarm: InsertAlarm): Promise<Alarm>;
  updateAlarm(id: number, alarm: Partial<InsertAlarm>): Promise<Alarm>;
  deleteAlarm(id: number): Promise<void>;
  
  getSettings(): Promise<Settings>;
  updateSettings(settings: UpdateSettingsRequest): Promise<Settings>;
}

export class DatabaseStorage implements IStorage {
  async getAlarms(): Promise<Alarm[]> {
    return await db.select().from(alarms);
  }

  async createAlarm(insertAlarm: InsertAlarm): Promise<Alarm> {
    const [alarm] = await db.insert(alarms).values(insertAlarm).returning();
    return alarm;
  }

  async updateAlarm(id: number, update: Partial<InsertAlarm>): Promise<Alarm> {
    const [alarm] = await db
      .update(alarms)
      .set(update)
      .where(eq(alarms.id, id))
      .returning();
    return alarm;
  }

  async deleteAlarm(id: number): Promise<void> {
    await db.delete(alarms).where(eq(alarms.id, id));
  }

  async getSettings(): Promise<Settings> {
    // Return the first settings row or create default if none exists
    const allSettings = await db.select().from(settings);
    if (allSettings.length === 0) {
      const [newSettings] = await db.insert(settings).values({}).returning();
      return newSettings;
    }
    return allSettings[0];
  }

  async updateSettings(update: UpdateSettingsRequest): Promise<Settings> {
    const current = await this.getSettings();
    const [updated] = await db
      .update(settings)
      .set(update)
      .where(eq(settings.id, current.id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
