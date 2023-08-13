import { UserDb } from '@/utils/server/storage';

import { PromptSchema, PromptSchemaArray } from '@/types/prompt';

import { procedure, router } from '../trpc';

import { z } from 'zod';

export const prompts = router({
  list: procedure.query(async ({ ctx }) => {
    const userDb = await UserDb.fromUserHash(ctx.userHash);
    return await userDb.getPrompts();
  }),
  remove: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userDb = await UserDb.fromUserHash(ctx.userHash);
      await userDb.removePrompt(input.id);
      return { success: true };
    }),
  update: procedure.input(PromptSchema).mutation(async ({ ctx, input }) => {
    const userDb = await UserDb.fromUserHash(ctx.userHash);
    await userDb.savePrompt(input);
    return { success: true };
  }),
  updateAll: procedure
    .input(PromptSchemaArray)
    .mutation(async ({ ctx, input }) => {
      const userDb = await UserDb.fromUserHash(ctx.userHash);
      await userDb.savePrompts(input);
      return { success: true };
    }),
});
