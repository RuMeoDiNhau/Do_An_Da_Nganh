"use strict";

const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const userController = require("../controllers/user.controller");

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/refresh", userController.refresh);
router.post("/logout", authMiddleware, userController.logout);

router.get("/me", authMiddleware, userController.me);
router.patch("/me", authMiddleware, userController.updateMe);
router.patch("/me/password", authMiddleware, userController.changeMyPassword);

router.get("/", authMiddleware, roleMiddleware(["admin"]), userController.listUsers);
router.get("/:userId", authMiddleware, roleMiddleware(["admin"]), userController.getUserById);
router.patch("/:userId/role", authMiddleware, roleMiddleware(["admin"]), userController.updateUserRole);

module.exports = router;