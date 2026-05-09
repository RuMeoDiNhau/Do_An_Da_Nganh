"use strict";
BigInt.prototype.toJSON = function () {
  return this.toString();
};
const express = require("express");
const cors = require("cors");

const apiRoutes = require("./routes/api");
const logger = require("./utils/logger");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api", apiRoutes);

// Basic error handler (keep last)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
