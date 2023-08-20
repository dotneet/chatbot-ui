import { UserDb } from '@/utils/server/storage';

import { ConversationSchema, ConversationSchemaArray } from '@/types/chat';

import { procedure, router } from '../trpc';

import { z } from 'zod';

export const conversations = router({
  list: procedure.query(async ({ ctx }) => {
    const userDb = await UserDb.fromUserId(ctx.userId);
    return await userDb.getConversations();
  }),
  remove: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userDb = await UserDb.fromUserId(ctx.userId);
      await userDb.removeConversation(input.id);
      return { success: true };
    }),
  removeAll: procedure.mutation(async ({ ctx }) => {
    const userDb = await UserDb.fromUserId(ctx.userId);
    await userDb.removeAllConversations();
    return { success: true };
  }),
  update: procedure
    .input(ConversationSchema)
    .mutation(async ({ ctx, input }) => {
      const userDb = await UserDb.fromUserId(ctx.userId);
      await userDb.saveConversation(input);
      return { success: true };
    }),
  updateAll: procedure
    .input(ConversationSchemaArray)
    .mutation(async ({ ctx, input }) => {
      const userDb = await UserDb.fromUserId(ctx.userId);
      await userDb.saveConversations(input);
      return { success: true };
    }),
});
