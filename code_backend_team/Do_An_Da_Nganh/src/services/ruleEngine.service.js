"use strict";

const { prisma } = require("../config/database");
const logger = require("../utils/logger");
const thresholdService = require("./threshold.service");

/**
 * Kiểm tra reading có vượt ngưỡng không và tạo alert nếu cần
 */
async function evaluateReading(reading) {
  // reading có thể là:
  // - { kind: "environment", temperature, humidity, light, gas, roomId, deviceId, ... }
  // - { kind: "single", sensorId, value, ... }

  if (!reading) return { ok: true, reading };

  const alerts = [];

  try {
    if (reading.kind === "environment") {
      // Kiểm tra từng metric
      if (typeof reading.temperature === "number") {
        const tempCheck = await thresholdService.checkThreshold(
          "temperature",
          reading.temperature
        );
        if (tempCheck.triggered) {
          alerts.push({
            type: "temperature_alert",
            reason: tempCheck.reason,
            value: reading.temperature,
            roomId: reading.roomId
          });
        }
      }

      if (typeof reading.humidity === "number") {
        const humidityCheck = await thresholdService.checkThreshold(
          "humidity",
          reading.humidity
        );
        if (humidityCheck.triggered) {
          alerts.push({
            type: "humidity_alert",
            reason: humidityCheck.reason,
            value: reading.humidity,
            roomId: reading.roomId
          });
        }
      }

      if (typeof reading.light === "number") {
        const lightCheck = await thresholdService.checkThreshold(
          "light",
          reading.light
        );
        if (lightCheck.triggered) {
          alerts.push({
            type: "light_alert",
            reason: lightCheck.reason,
            value: reading.light,
            roomId: reading.roomId
          });
        }
      }

      if (typeof reading.gas === "number") {
        const gasCheck = await thresholdService.checkThreshold("gas", reading.gas);
        if (gasCheck.triggered) {
          alerts.push({
            type: "gas_alert",
            reason: gasCheck.reason,
            value: reading.gas,
            roomId: reading.roomId
          });
        }
      }
    } else if (reading.kind === "single") {
      // Kiểm tra single sensor
      const metricCheck = await thresholdService.checkThreshold(
        reading.sensorId,
        reading.value
      );
      if (metricCheck.triggered) {
        alerts.push({
          type: `${reading.sensorId}_alert`,
          reason: metricCheck.reason,
          value: reading.value,
          roomId: reading.roomId
        });
      }
    }

    // Tạo alert records nếu có vi phạm
    for (const alert of alerts) {
      try {
        await thresholdService.createAlert({
          alertType: alert.type,
          roomId: alert.roomId,
          metadata: {
            reason: alert.reason,
            value: alert.value,
            readingKind: reading.kind,
            timestamp: new Date().toISOString()
          }
        });
      } catch (err) {
        logger.error({ err, alert }, "Failed to create alert");
      }
    }

    return { ok: true, reading, alerts };
  } catch (err) {
    logger.error({ err, reading }, "Rule engine evaluation failed");
    return { ok: false, error: err.message, reading };
  }
}

async function getLatestReadings() {
  const latest = await prisma.environment.findMany({
    take: 50,
    orderBy: { time_created: "desc" },
    include: { rooms: true }
  });

  return latest;
}

module.exports = { evaluateReading, getLatestReadings };