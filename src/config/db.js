let prisma;

const getPrismaClient = async () => {
  if (!prisma) {
    const { PrismaClient } = await import("@prisma/client");
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const { Pool } = await import("pg");
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    const adapter = new PrismaPg(pool);
    
    prisma = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
      adapter
    });
  }
  return prisma;
};

const connectDB = async () => {
  try {
    const client = await getPrismaClient();
    await client.$connect();
    console.log("Database Connected via Prisma");
  } catch (e) {
    console.error(`Database connection error: ${e}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  const client = await getPrismaClient();
  await client.$disconnect();
};

export { getPrismaClient, connectDB, disconnectDB };
