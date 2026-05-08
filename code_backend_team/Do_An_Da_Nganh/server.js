"use strict";

require("dotenv").config();
const http = require("http");

const app = require("./src/app");
const { connectDb, disconnectDb } = require("./src/config/database");
const { initWebSocketServer } = require("./src/iot/wsHandler");
const { initMqtt } = require("./src/iot/mqttHandler");
const logger = require("./src/utils/logger");

function envFlag(name) {
  const v = String(process.env[name] || "").toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

async function main() {
  const port = Number(process.env.PORT || 3001);
  const requireDb = envFlag("REQUIRE_DB");
  const requireMqtt = envFlag("REQUIRE_MQTT");

  if (requireDb) {
    try {
      await connectDb();
    } catch (err) {
      logger.warn({ err }, "Database connect failed");
      throw err;
    }
  } else {
    logger.info("Database disabled (REQUIRE_DB=false)");
  }

  const server = http.createServer(app);
  const { broadcast } = initWebSocketServer(server);

  if (requireMqtt) {
    try {
      if (!process.env.MQTT_URL) {
        throw new Error("Missing MQTT_URL");
      }
      initMqtt({ broadcast });
    } catch (err) {
      logger.warn({ err }, "MQTT init failed");
      throw err;
    }
  } else {
    logger.info("MQTT disabled (REQUIRE_MQTT=false)");
  }

  server.listen(port, () => {
    logger.info({ port }, "Server listening");
  });

  const shutdown = async () => {
    logger.info("Shutting down");
    try {
      await disconnectDb();
    } catch (err) {
      logger.warn({ err }, "DB disconnect failed");
    }
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});