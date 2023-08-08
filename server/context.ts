
import { getUserHash } from '@/utils/server/auth';

import { inferAsyncReturnType } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';

export async function createContext(opts: CreateNextContextOptions) {
  let userHash: string | undefined;
  userHash = await getUserHash(opts.req, opts.res);
  return {
    req: opts.req,
    res: opts.res,
    userHash,
  };
}
export type Context = inferAsyncReturnType<typeof createContext>;
