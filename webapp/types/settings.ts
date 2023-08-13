import * as z from 'zod';

export const SettingsSchema = z.object({
  userId: z.string(),
  theme: z.enum(['light', 'dark']),
  defaultTemperature: z.number(),
});

export type Settings = z.infer<typeof SettingsSchema>;
