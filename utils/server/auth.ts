import { NextApiRequest, NextApiResponse } from 'next';

import crypto from 'crypto';

export const ensureHasValidSession = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<boolean> => {
  // TODO: check if email is in request headers
  return true;
  // const session = await getServerSession(req, res, {});
  // return session !== null;
};

export const getUserHash = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<string> => {
  // TODO: Get user email from request headers
  return getUserHashFromMail("test@example.com")
};

export const getUserHashFromMail = (email: string): string => {
  const hash = crypto.createHash('sha256').update(email).digest('hex');
  return hash;
};
