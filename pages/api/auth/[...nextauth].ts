import NextAuth, { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

import { getUserHashFromMail } from '@/utils/server/auth';
import clientPromise from '@/utils/server/mongodb';

import { Magic } from '@magic-sdk/admin';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';

const magic = new Magic(process.env.MAGIC_SECRET_KEY);

const providers = process.env.NEXTAUTH_ENABLED
  ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
      GithubProvider({
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      }),
      Credentials({
        credentials: {
          didToken: { label: 'DID Token', type: 'text' },
        },
        async authorize(credentials: any, req: any) {
          const { didToken } = credentials;
          // validate magic DID token
          magic.token.validate(didToken);
          // fetch user metadata
          const metadata = await magic.users.getMetadataByToken(didToken);
          // return user info
          return { ...metadata };
        },
      }),
    ]
  : [
      Credentials({
        credentials: {
          email: { label: 'Email', type: 'text' },
        },
        async authorize(credentials: any, req: any) {
          const email = credentials.email.trim();
          const id = getUserHashFromMail(email);
          return {
            id,
            email,
          };
        },
      }),
    ];

export const authOptions: NextAuthOptions = {
  providers: providers,
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: 'jwt' },
  pages: {
    signIn: process.env.NEXTAUTH_ENABLED ? '/auth/login' : '/auth/autologin',
  },
};

export default NextAuth(authOptions);
