import { PrismaClient } from "../generated/prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  // Cloud environment (Vercel/Neon) -> Connect over Neon Serverless WebSockets
  const { neonConfig } = require("@neondatabase/serverless");
  const { PrismaNeon } = require("@prisma/adapter-neon");
  const ws = require("ws");

  neonConfig.webSocketConstructor = ws;
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  prisma = new PrismaClient({ adapter });

} else {
  // Local environment -> Connect to local proxy using pg driver
  const { Pool } = require("pg");
  const { PrismaPg } = require("@prisma/adapter-pg");

  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pool: any | undefined;
  };

  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg(globalForPrisma.pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
