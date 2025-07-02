import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.ts';

const client = postgres(process.env.DATABASE_URL!);

// Add logger: true for debugging queries
export const db = drizzle(client, { schema });
