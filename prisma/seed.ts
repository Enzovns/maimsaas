import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seed complete (no seed data required).");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
