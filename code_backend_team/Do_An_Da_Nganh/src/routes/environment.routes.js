"use strict";

const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const environmentController = require("../controllers/environment.controller");

const router = express.Router();

router.get("/", authMiddleware, environmentController.listLatest);
router.get("/latest", authMiddleware, environmentController.latest);
router.get("/snapshot", authMiddleware, environmentController.snapshot);
router.get("/history", authMiddleware, environmentController.history);
router.get("/rooms", authMiddleware, environmentController.rooms);
router.post("/rooms", authMiddleware, environmentController.createRoom);
router.get("/rooms/latest", authMiddleware, environmentController.latestByRoom);

module.exports = router;
