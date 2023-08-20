import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { exit } from 'process';

const sql = postgres(process.env.POSTGRES_URI!, { max: 1 });
const db = drizzle(sql);

const migrateDB = async () => {
  console.log('migrating...');
  await migrate(db, { migrationsFolder: 'migrations-folder' });
  console.log('migrated!');
  exit();
};

migrateDB();
