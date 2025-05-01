import { PrismaClient } from "../generated/prisma";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Test connection
prisma.$connect()
    .then((): void => console.log("Connected to the database successfully."))
    .catch((error: Error): void => console.error("Error connecting to the database:", error))
    .finally((): Promise<void> => prisma.$disconnect());

export default prisma;