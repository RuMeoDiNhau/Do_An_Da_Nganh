"use strict";

const mqtt = require("mqtt");
const logger = require("../utils/logger");

function connectMqtt() {
  const url = process.env.MQTT_URL;
  const username = process.env.MQTT_USERNAME || undefined;
  const password = process.env.MQTT_PASSWORD || undefined;

  if (!url) {
    throw new Error("Missing MQTT_URL");
  }

  const clientId =
    process.env.MQTT_CLIENT_ID ||
    `backend-smarthome-${Math.random().toString(16).slice(2, 10)}`;

  const client = mqtt.connect(url, {
    clientId,
    username,
    password,
    reconnectPeriod: 1000,
    clean: true,
    connectTimeout: 10_000

    // TODO: nếu broker cloud yêu cầu TLS cert/custom CA
    // rejectUnauthorized: false,
    // ca: fs.readFileSync("..."),
    // cert: fs.readFileSync("..."),
    // key: fs.readFileSync("...")
  });

  client.on("connect", (connack) => {
    logger.info(
      {
        url,
        clientId,
        sessionPresent: connack?.sessionPresent
      },
      "MQTT connected"
    );
  });

  client.on("reconnect", () => {
    logger.warn({ clientId }, "MQTT reconnecting");
  });

  client.on("offline", () => {
    logger.warn({ clientId }, "MQTT offline");
  });

  client.on("close", () => {
    logger.warn({ clientId }, "MQTT connection closed");
  });

  client.on("error", (err) => {
    logger.error({ err, clientId }, "MQTT error");
  });

  return client;
}

module.exports = { connectMqtt };