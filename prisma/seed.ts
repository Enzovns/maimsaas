import { PrismaClient } from "@prisma/client";
import { MINING_COMPANIES_SEED } from "../src/lib/mining-companies";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding mining companies...");

  for (const company of MINING_COMPANIES_SEED) {
    await prisma.miningCompany.upsert({
      where: { email: company.email },
      update: {},
      create: company,
    });
  }

  console.log(`Seeded ${MINING_COMPANIES_SEED.length} mining companies.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
