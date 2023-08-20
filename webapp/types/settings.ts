import * as z from 'zod';

export const SettingsSchema = z.object({
  userId: z.number(),
  theme: z.enum(['light', 'dark']),
  defaultTemperature: z.number(),
});

export type Settings = z.infer<typeof SettingsSchema>;
