import { drizzle, PostgresJsDatabase  } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// for query purposes
const queryClient = postgres(process.env.POSTGRES_URI!);
export const db: PostgresJsDatabase = drizzle(queryClient);
