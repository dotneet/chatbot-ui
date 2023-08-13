import { UserDb } from '@/utils/server/storage';

import { SettingsSchema } from '@/types/settings';

import { procedure, router } from '../trpc';

export const settings = router({
  get: procedure.query(async ({ ctx }) => {
    try {
      const userDb = await UserDb.fromUserHash(ctx.userHash);
      return await userDb.getSettings();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }),
  settingsUpdate: procedure
    .input(SettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const userDb = await UserDb.fromUserHash(ctx.userHash);
      await userDb.saveSettings(input);
      return { success: true };
    }),
});
