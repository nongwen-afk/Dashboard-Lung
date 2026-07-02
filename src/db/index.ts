import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

if (typeof window !== "undefined") {
  throw new Error("Database client can only be used on the server.");
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

const client = postgres(databaseUrl, {
  ssl: "require",
  max: 1,
});

export const db = drizzle(client);
