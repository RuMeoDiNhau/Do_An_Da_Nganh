"use strict";

const express = require("express");

const userRoutes = require("./user.routes");
const deviceRoutes = require("./device.routes");
const environmentRoutes = require("./environment.routes");

const router = express.Router();

router.use("/users", userRoutes);
router.use("/devices", deviceRoutes);
router.use("/environment", environmentRoutes);

module.exports = router;
