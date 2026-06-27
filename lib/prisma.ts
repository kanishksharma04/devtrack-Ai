import { PrismaClient } from "./generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const getConnectionString = (): string => {
  const urlStr = process.env.DATABASE_URL || "";
  if (urlStr.startsWith("prisma+postgres://")) {
    try {
      const url = new URL(urlStr);
      const apiKey = url.searchParams.get("api_key");
      if (apiKey) {
        const decoded = JSON.parse(Buffer.from(apiKey, "base64").toString("utf-8"));
        if (decoded && decoded.databaseUrl) {
          return decoded.databaseUrl;
        }
      }
    } catch (e) {
      console.error("Failed to parse base64 database url from prisma+postgres:", e);
    }
  }
  return urlStr;
};

const connectionString = getConnectionString();
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
export { PrismaClient };
