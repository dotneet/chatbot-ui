import { UserDb } from '@/utils/server/storage';

import { FolderSchema, FolderSchemaArray } from '@/types/folder';

import { procedure, router } from '../trpc';

import { z } from 'zod';

export const folders = router({
  list: procedure.query(async ({ ctx }) => {
    const userDb = await UserDb.fromUserId(ctx.userId, ctx.userEmail);
    return await userDb.getFolders();
  }),
  remove: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userDb = await UserDb.fromUserId(ctx.userId, ctx.userEmail);
      await userDb.removeFolder(input.id);
      return { success: true };
    }),
  removeAll: procedure
    .input(z.object({ type: z.enum(['chat', 'prompt']) }))
    .mutation(async ({ ctx, input }) => {
      const userDb = await UserDb.fromUserId(ctx.userId, ctx.userEmail);
      await userDb.removeAllFolders(input.type);
      return { success: true };
    }),
  update: procedure.input(FolderSchema).mutation(async ({ ctx, input }) => {
    const userDb = await UserDb.fromUserId(ctx.userId, ctx.userEmail);
    await userDb.saveFolder(input);
    return { success: true };
  }),
  updateAll: procedure
    .input(FolderSchemaArray)
    .mutation(async ({ ctx, input }) => {
      const userDb = await UserDb.fromUserId(ctx.userId, ctx.userEmail);
      await userDb.saveFolders(input);
      return { success: true };
    }),
});
