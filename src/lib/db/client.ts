import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Connection string comes from Supabase project settings → Database → Connection string
const connectionString = process.env.DATABASE_URL!;

// Disable prefetch for Supabase transaction pooler (port 6543)
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
