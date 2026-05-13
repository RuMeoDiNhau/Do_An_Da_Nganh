"use strict";

const deviceService = require("../services/device.service");
const { getBroadcast } = require("../iot/wsHandler");

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

async function update(req, res, next) {
  try {
    const deviceId = req.params.id;
    const device = await deviceService.updateDevice({ deviceId, data: req.body || {} });
    res.json({ device });
  } catch (err) {
    next(err);
  }
}

async function faceAccessWebhook(req, res, next) {
  try {
    const payload = req.body;
    
    if (payload.action === "unlock") {
      // 1. Phát sóng WebSocket lên UI để giao diện cập nhật ngay lập tức
      const broadcast = getBroadcast();
      if (broadcast) {
        broadcast({ type: "FACE_DETECTED", data: payload });
      }

      // 2. Gửi lệnh MQTT mở cửa (Thay deviceId thành ID cửa của bạn)
      // await deviceService.controlDevice({ deviceId: "front_door", action: "turn_on" });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, update, control, faceAccessWebhook };
