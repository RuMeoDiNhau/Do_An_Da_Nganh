"use strict";

const WebSocket = require("ws");
const logger = require("../utils/logger");

function initWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (socket) => {
    logger.info("WS client connected");
    socket.send(JSON.stringify({ type: "hello", ts: Date.now() }));

    socket.on("close", () => logger.info("WS client disconnected"));
  });

  function broadcast(obj) {
    const data = typeof obj === "string" ? obj : JSON.stringify(obj);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(data);
    });
  }

  return { wss, broadcast };
}

module.exports = { initWebSocketServer };
