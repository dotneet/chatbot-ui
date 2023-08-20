import { getUserEmail, getUserId, getUserToken } from '@/utils/server/auth';

import { inferAsyncReturnType } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';

export async function createContext(opts: CreateNextContextOptions) {
  let userId: string | undefined;
  userId = await getUserId(opts.req, opts.res);
  let userEmail = await getUserEmail(opts.req, opts.res);
  let userToken = await getUserToken(opts.req, opts.res);
  return {
    req: opts.req,
    res: opts.res,
    userId,
    userEmail,
    userToken,
  };
}
export type Context = inferAsyncReturnType<typeof createContext>;
