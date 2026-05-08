"use strict";

const pino = require("pino");

function tryPrettyTransport() {
  if (process.env.NODE_ENV === "production") return undefined;

  try {
    require.resolve("pino-pretty");
    return {
      target: "pino-pretty",
      options: { colorize: true, translateTime: "SYS:standard" }
    };
  } catch {
    // If pino-pretty isn't installed, fall back to default JSON logs.
    return undefined;
  }
}

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: tryPrettyTransport()
});

module.exports = logger;