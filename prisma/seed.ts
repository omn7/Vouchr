import { prisma } from "../src/lib/db";
import { hashPassword } from "../src/lib/hash";

async function main() {
  console.log("Seeding database...");

  const defaultPassword = hashPassword("password123");

  // Create default roles if they do not exist
  const employee = await prisma.user.upsert({
    where: { email: "employee@vouchr.com" },
    update: {},
    create: {
      name: "John Employee",
      email: "employee@vouchr.com",
      password: defaultPassword,
      role: "EMPLOYEE",
    },
  });

  const director = await prisma.user.upsert({
    where: { email: "director@vouchr.com" },
    update: {},
    create: {
      name: "Sarah Director",
      email: "director@vouchr.com",
      password: defaultPassword,
      role: "DIRECTOR",
    },
  });

  const accounts = await prisma.user.upsert({
    where: { email: "accounts@vouchr.com" },
    update: {},
    create: {
      name: "David Accounts",
      email: "accounts@vouchr.com",
      password: defaultPassword,
      role: "ACCOUNTS",
    },
  });

  console.log("Database seeded successfully without wiping existing data!");
  console.log({
    employee: employee.email,
    director: director.email,
    accounts: accounts.email,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
