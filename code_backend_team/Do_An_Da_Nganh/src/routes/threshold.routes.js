"use strict";

const express = require("express");
const thresholdController = require("../controllers/threshold.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

// Threshold CRUD
router.get("/", authMiddleware, thresholdController.listThresholds);
router.get("/:configKey", authMiddleware, thresholdController.getThreshold);
router.post("/", authMiddleware, thresholdController.setThreshold);

module.exports = router;
