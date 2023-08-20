import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',
  out: './migrations-folder',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.POSTGRES_URI!,
  },
} satisfies Config;
