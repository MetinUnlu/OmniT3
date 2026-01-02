import { PrismaClient } from "../generated/prisma/index.js";
import { auth } from "../src/server/better-auth/index.js";

const prisma = new PrismaClient();

async function main() {
  const superUserEmail = process.env.SUPER_USER_EMAIL;
  const superUserPassword = process.env.SUPER_USER_PASSWORD;

  if (!superUserEmail || !superUserPassword) {
    console.log("⚠️  Super user credentials not found in environment variables");
    console.log("   Skipping super user creation");
    return;
  }

  // Check if super user already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email: superUserEmail,
    },
  });

  if (existingUser) {
    console.log("✅ Super user already exists:", superUserEmail);
    return;
  }

  // Use Better Auth API to create user with proper password hashing
  const result = await auth.api.signUpEmail({
    body: {
      email: superUserEmail,
      password: superUserPassword,
      name: "Super User",
    },
  });

  if (result) {
    // Update the user to set SUPER_USER role
    await prisma.user.update({
      where: {
        email: superUserEmail,
      },
      data: {
        role: "SUPER_USER",
      },
    });

    console.log("✅ Super user created successfully!");
    console.log("   Email:", superUserEmail);
    console.log("   Role: SUPER_USER");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
