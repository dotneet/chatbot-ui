import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// for query purposes
const queryClient = postgres(process.env.POSTGRES_URI!);
export const PostgresDB: PostgresJsDatabase = drizzle(queryClient);
