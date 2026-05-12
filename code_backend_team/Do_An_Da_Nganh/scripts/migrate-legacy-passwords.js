"use strict";

require("dotenv").config();

const bcrypt = require("bcryptjs");
const { prisma, disconnectDb } = require("../src/config/database");

function isBcryptHash(value) {
  return typeof value === "string" && /^\$2[aby]\$\d{2}\$/.test(value) && value.length >= 60;
}

async function main() {
  const users = await prisma.users.findMany({
    select: {
      u_id: true,
      username: true,
      password: true,
    },
  });

  const legacyUsers = users.filter((user) => !isBcryptHash(user.password));

  if (legacyUsers.length === 0) {
    console.log("No legacy plaintext passwords found.");
    return;
  }

  for (const user of legacyUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.users.update({
      where: { u_id: user.u_id },
      data: { password: hashedPassword },
    });
  }

  console.log(`Migrated ${legacyUsers.length} user password(s) to bcrypt.`);
  console.log(
    JSON.stringify(
      legacyUsers.map((user) => ({ username: user.username })),
      null,
      2,
    ),
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDb().catch(() => undefined);
  });
