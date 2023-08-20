import { NextApiRequest, NextApiResponse } from 'next';

import crypto from 'crypto';

export const ensureHasValidSession = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<boolean> => {
  // check if email is in request headers
  let userEmail = req.headers['x-user-email'];
  if (!userEmail) {
    return false;
  }
  return true;
};

export const getUserToken = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<string> => {
  // Get user token from request bearer headers (will be injected by RAPID, or locally via nginx)
  let token = req.headers['authorization'];
  if (!token) {
    throw new Error('Unauthorized');
  }
  return token?.split(' ')[1] as string;
};

export const getUserId = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<string> => {
  // Get user id from request headers
  let userId = req.headers['x-user-id'];
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId as string;
};

export const getUserEmail = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<string> => {
  // Get user id from request headers
  let userEmail = req.headers['x-user-email'];
  if (!userEmail) {
    throw new Error('Unauthorized');
  }
  return userEmail as string;
};

export const getUserHashFromMail = (email: string): string => {
  const hash = crypto.createHash('sha256').update(email).digest('hex');
  return hash;
};
