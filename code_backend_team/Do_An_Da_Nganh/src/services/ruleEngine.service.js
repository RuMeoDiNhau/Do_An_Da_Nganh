"use strict";

const { prisma } = require("../config/database");

// Placeholder: implement your thresholds / alert rules here.
async function evaluateReading(reading) {
  // reading có thể là:
  // - { kind: "environment", temperature, humidity, light, gas, roomId, deviceId, ... }
  // - { kind: "single", sensorId, value, ... }

  // TODO:
  // - đọc threshold từ bảng threshold
  // - tạo alert nếu vượt ngưỡng
  // - map alert vào room thông qua reading.roomId hoặc device -> room

  return { ok: true, reading };
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