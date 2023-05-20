import * as z from 'zod';

export const SettingsSchema = z.object({
  userId: z.string(),
  theme: z.enum(['light', 'dark']),
  language: z.enum([
    'ar',
    'bn',
    'de',
    'en',
    'es',
    'fr',
    'he',
    'id',
    'it',
    'ja',
    'ko',
    'pl',
    'pt',
    'ro',
    'ru',
    'si',
    'sv',
    'te',
    'vi',
    'zh',
  ]),
  defaultTemperature: z.number(),
});

export type Settings = z.infer<typeof SettingsSchema>;
