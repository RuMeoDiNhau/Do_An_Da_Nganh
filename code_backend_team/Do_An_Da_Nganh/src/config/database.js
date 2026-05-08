"use strict";

const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");

const prisma = new PrismaClient({
  log: ["warn", "error"]
});

async function connectDb() {
  await prisma.$connect();
  logger.info("Database connected (Prisma)");
}

async function disconnectDb() {
  await prisma.$disconnect();
  logger.info("Database disconnected (Prisma)");
}

module.exports = { prisma, connectDb, disconnectDb };
