#!/usr/bin/env node
/**
 * Script khởi tạo threshold mặc định
 * Chạy: node scripts/init-thresholds.js
 */

require("dotenv").config();

const { prisma } = require("../src/config/database");

const DEFAULT_THRESHOLDS = [
  {
    configKey: "temperature_threshold",
    configValue: {
      min: 16,
      max: 32,
      enabled: true,
      unit: "°C"
    }
  },
  {
    configKey: "humidity_threshold",
    configValue: {
      min: 30,
      max: 80,
      enabled: true,
      unit: "%"
    }
  },
  {
    configKey: "gas_threshold",
    configValue: {
      min: null,
      max: 50,
      enabled: true,
      unit: "ppm"
    }
  },
  {
    configKey: "light_threshold",
    configValue: {
      min: 0,
      max: 100,
      enabled: true,
      unit: "%"
    }
  }
];

async function main() {
  try {
    console.log("Initializing default thresholds...");

    for (const threshold of DEFAULT_THRESHOLDS) {
      const result = await prisma.threshold.upsert({
        where: { config_key: threshold.configKey },
        update: { config_value: threshold.configValue },
        create: {
          config_key: threshold.configKey,
          config_value: threshold.configValue
        }
      });

      console.log(`✓ ${threshold.configKey}:`, result.config_value);
    }

    console.log("\n✓ All default thresholds initialized successfully");
  } catch (err) {
    console.error("Error initializing thresholds:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
