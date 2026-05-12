"use strict";

const environmentService = require("../services/environment.service");

function parseDateOrNull(value) {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

async function listLatest(req, res, next) {
  try {
    const { limit, roomId } = req.query;
    const data = await environmentService.getLatestReadings({ limit, roomId });
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function latest(req, res, next) {
  try {
    const { roomId } = req.query;
    const data = await environmentService.getLatestReading({ roomId });
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function history(req, res, next) {
  try {
    const { roomId, limit, from, to } = req.query;
    const data = await environmentService.getReadingHistory({
      roomId,
      limit,
      from: parseDateOrNull(from),
      to: parseDateOrNull(to)
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function latestByRoom(req, res, next) {
  try {
    const { scanLimit } = req.query;
    const data = await environmentService.getLatestReadingsByRoom({ scanLimit });
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function rooms(req, res, next) {
  try {
    const data = await environmentService.listRooms();
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function snapshot(req, res, next) {
  try {
    const { roomId, scanLimit } = req.query;
    const data = await environmentService.getLatestSnapshot({ roomId, scanLimit });
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listLatest,
  latest,
  history,
  latestByRoom,
  rooms,
  snapshot
};
