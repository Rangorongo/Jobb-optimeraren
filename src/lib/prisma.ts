import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// idleTimeoutMillis: 0 disables node-postgres's default 10s idle-connection
// close. That default is a serverless cost-saving pattern that actively hurts
// us here - we're a long-lived server process, and a request landing just as
// the pool closes an "idle" connection surfaces as an unhandled
// "Connection terminated unexpectedly" error instead of a clean retry.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  idleTimeoutMillis: 0,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
