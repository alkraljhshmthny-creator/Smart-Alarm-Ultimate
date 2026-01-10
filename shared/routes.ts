import { z } from 'zod';
import { insertAlarmSchema, insertSettingsSchema, alarms, settings } from './schema';

export const api = {
  alarms: {
    list: {
      method: 'GET' as const,
      path: '/api/alarms',
      responses: {
        200: z.array(z.custom<typeof alarms.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/alarms',
      input: insertAlarmSchema,
      responses: {
        201: z.custom<typeof alarms.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/alarms/:id',
      input: insertAlarmSchema.partial(),
      responses: {
        200: z.custom<typeof alarms.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/alarms/:id',
      responses: {
        204: z.void(),
        404: z.object({ message: z.string() }),
      },
    },
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings',
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/settings',
      input: insertSettingsSchema.partial(),
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
