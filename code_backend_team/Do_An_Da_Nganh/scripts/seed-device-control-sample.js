"use strict";

require("dotenv").config();

const { prisma, disconnectDb } = require("../src/config/database");

const ROOM_SEEDS = [
  {
    name: "Living Room",
    room_type: "living_room",
    environment: { temp: 24.5, humidity: 56, bright: 78, gas_level: 420 },
    devices: [
      { device_id: "living-room-main-light", d_name: "Main Light", type: "light", state: "on" },
      { device_id: "living-room-ceiling-fan", d_name: "Ceiling Fan", type: "fan", state: "on" }
    ]
  },
  {
    name: "Kitchen",
    room_type: "kitchen",
    environment: { temp: 26.1, humidity: 58, bright: 72, gas_level: 415 },
    devices: [
      { device_id: "kitchen-light", d_name: "Kitchen Light", type: "light", state: "off" },
      { device_id: "kitchen-range-hood", d_name: "Range Hood", type: "fan", state: "off" }
    ]
  },
  {
    name: "Bedroom",
    room_type: "bedroom",
    environment: { temp: 23.7, humidity: 61, bright: 42, gas_level: 405 },
    devices: [
      { device_id: "bedroom-bedside-lamp", d_name: "Bedside Lamp", type: "light", state: "on" },
      { device_id: "bedroom-desk-fan", d_name: "Desk Fan", type: "fan", state: "off" }
    ]
  },
  {
    name: "Office",
    room_type: "office",
    environment: { temp: 25.2, humidity: 54, bright: 64, gas_level: 398 },
    devices: [
      { device_id: "office-desk-light", d_name: "Desk Light", type: "light", state: "on" },
      { device_id: "office-standing-fan", d_name: "Standing Fan", type: "fan", state: "on" }
    ]
  }
];

async function resolveOwnerId() {
  const owner = await prisma.users.findFirst({
    orderBy: { username: "asc" },
    select: { u_id: true }
  });

  return owner?.u_id || null;
}

async function ensureRoom(seed, ownerId) {
  const existing = await prisma.rooms.findFirst({
    where: { name: seed.name },
    select: { r_id: true, name: true }
  });

  if (existing) {
    return existing;
  }

  return prisma.rooms.create({
    data: {
      name: seed.name,
      room_type: seed.room_type,
      u_id: ownerId
    },
    select: { r_id: true, name: true }
  });
}

async function ensureDevice(seed, roomId) {
  return prisma.devices.upsert({
    where: { device_id: seed.device_id },
    update: {
      d_name: seed.d_name,
      type: seed.type,
      state: seed.state,
      r_id: roomId
    },
    create: {
      device_id: seed.device_id,
      d_name: seed.d_name,
      type: seed.type,
      state: seed.state,
      r_id: roomId
    }
  });
}

async function ensureEnvironment(seed, roomId) {
  const existing = await prisma.environment.findFirst({
    where: { r_id: roomId }
  });

  if (existing) {
    return existing;
  }

  return prisma.environment.create({
    data: {
      r_id: roomId,
      temp: seed.temp,
      humidity: seed.humidity,
      bright: seed.bright,
      gas_level: seed.gas_level
    }
  });
}

async function main() {
  const ownerId = await resolveOwnerId();

  for (const roomSeed of ROOM_SEEDS) {
    const room = await ensureRoom(roomSeed, ownerId);

    for (const deviceSeed of roomSeed.devices) {
      await ensureDevice(deviceSeed, room.r_id);
    }

    await ensureEnvironment(roomSeed.environment, room.r_id);
  }

  console.log(`Seeded ${ROOM_SEEDS.length} room(s) and ${ROOM_SEEDS.reduce((sum, room) => sum + room.devices.length, 0)} device(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDb().catch(() => undefined);
  });
