"use strict";

const deviceService = require("../services/device.service");

async function list(req, res, next) {
  try {
    const devices = await deviceService.listDevices();
    res.json({ devices });
  } catch (err) {
    next(err);
  }
}

async function control(req, res, next) {
  try {
    const deviceId = req.params.id;
    const { action, payload } = req.body || {};
    const result = await deviceService.controlDevice({ deviceId, action, payload, actor: req.user });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, control };
