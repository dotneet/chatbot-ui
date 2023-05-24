import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: process.env.NEXTAUTH_ENABLED ? '/auth/login' : '/auth/autologin',
  },
});

export const config = { matcher: ['/'] };
