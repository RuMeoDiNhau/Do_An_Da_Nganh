"use strict";

const { prisma } = require("../config/database");
const { connectMqtt } = require("../config/mqtt");

let mqttClient;

function getMqttClient() {
  if (!mqttClient) mqttClient = connectMqtt();
  return mqttClient;
}

function publishAsync(client, topic, message) {
  return new Promise((resolve, reject) => {
    client.publish(topic, message, { qos: 1 }, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function parseJsonMap(value) {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    return {};
  }
}

function getControlTopicMap() {
  const rawMap = parseJsonMap(process.env.MQTT_CONTROL_TOPIC_MAP);
  const normalized = {};

  for (const [key, value] of Object.entries(rawMap)) {
    normalized[String(key).toLowerCase()] = value;
  }

  return normalized;
}

function getControlValueMap() {
  const rawMap = parseJsonMap(process.env.MQTT_CONTROL_VALUE_MAP);
  const normalized = {};

  for (const [key, value] of Object.entries(rawMap)) {
    normalized[String(key).toLowerCase()] = String(value);
  }

  return normalized;
}

async function listDevices() {
  return prisma.devices.findMany({
    orderBy: { device_id: "asc" }
  });
}

async function findDevice(deviceId) {
  return prisma.devices.findUnique({
    where: { device_id: deviceId }
  });
}

function resolveControlTopic({ deviceId, device }) {
  const topicMap = getControlTopicMap();
  const candidates = [
    deviceId,
    device?.type,
    device?.d_name
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  for (const candidate of candidates) {
    if (topicMap[candidate]) {
      return topicMap[candidate];
    }
  }

  return process.env.MQTT_TOPIC_CONTROL || null;
}

function resolveControlValue({ action, payload }) {
  if (
    payload &&
    typeof payload === "object" &&
    payload.value !== undefined &&
    payload.value !== null
  ) {
    return String(payload.value);
  }

  const actionMap = getControlValueMap();
  const mapped = actionMap[String(action).toLowerCase()];

  if (mapped !== undefined) {
    return mapped;
  }

  if (typeof payload === "string" || typeof payload === "number") {
    return String(payload);
  }

  return JSON.stringify({
    action,
    payload: payload ?? null
  });
}

async function controlDevice({ deviceId, action, payload, actor }) {
  if (!deviceId) throw new Error("deviceId is required");
  if (!action) throw new Error("action is required");

  const device = await findDevice(deviceId);
  const topic = resolveControlTopic({ deviceId, device });

  if (!topic) {
    throw new Error("No control topic configured for this device");
  }

  const value = resolveControlValue({ action, payload });

  await publishAsync(getMqttClient(), topic, value);

  const event = {
    deviceId,
    topic,
    action,
    publishedValue: value,
    payload: payload ?? null,
    actor: actor ? { sub: actor.sub, email: actor.email } : null,
    ts: new Date().toISOString()
  };

  if (device) {
    await prisma.control_log.create({
      data: {
        device_id: deviceId,
        u_id: actor?.sub || null,
        event
      }
    }).catch(() => null);
  }

  return {
    ok: true,
    topic,
    value
  };
}

module.exports = { listDevices, controlDevice };
