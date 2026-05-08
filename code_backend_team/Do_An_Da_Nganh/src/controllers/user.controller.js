"use strict";

const authService = require("../services/auth.service");
const userService = require("../services/user.service");

function handleAuthError(err, res, next) {
  const message = String(err?.message || "");

  if (
    message === "username and password are required" ||
    message === "username/email and password are required" ||
    message === "refreshToken is required" ||
    message === "password must be at least 6 characters"
  ) {
    return res.status(400).json({ error: message });
  }

  if (message === "username or email already exists") {
    return res.status(409).json({ error: message });
  }

  if (message === "invalid credentials") {
    return res.status(401).json({ error: message });
  }

  if (
    message.includes("token") ||
    message === "jwt expired" ||
    message === "jwt malformed" ||
    message === "invalid signature"
  ) {
    return res.status(401).json({ error: message });
  }

  return next(err);
}

function handleUserError(err, res, next) {
  const message = String(err?.message || "");

  if (message === "user not found") {
    return res.status(404).json({ error: message });
  }

  if (
    message === "no updatable fields" ||
    message === "currentPassword and newPassword are required" ||
    message === "newPassword must be at least 6 characters" ||
    message.startsWith("role must be one of")
  ) {
    return res.status(400).json({ error: message });
  }

  if (message === "username or email already exists") {
    return res.status(409).json({ error: message });
  }

  if (message === "current password is incorrect") {
    return res.status(401).json({ error: message });
  }

  return next(err);
}

async function register(req, res, next) {
  try {
    const { username, email, password, faceLabel, displayName } = req.body || {};
    const user = await authService.register({ username, email, password, faceLabel, displayName });
    res.status(201).json({ user });
  } catch (err) {
    handleAuthError(err, res, next);
  }
}

async function login(req, res, next) {
  try {
    const { username, email, identifier, password } = req.body || {};
    const result = await authService.login({ username, email, identifier, password });
    res.json(result);
  } catch (err) {
    handleAuthError(err, res, next);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body || {};
    const result = await authService.refresh({ refreshToken });
    res.json(result);
  } catch (err) {
    handleAuthError(err, res, next);
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body || {};
    const result = authService.logout({ accessPayload: req.user, refreshToken });
    res.json(result);
  } catch (err) {
    handleAuthError(err, res, next);
  }
}

async function me(req, res, next) {
  try {
    const user = await userService.findPublicUserById(req.user.sub);
    res.json({ user });
  } catch (err) {
    handleUserError(err, res, next);
  }
}

async function listUsers(req, res, next) {
  try {
    const { page, pageSize, search, role } = req.query || {};
    const result = await userService.listUsers({ page, pageSize, search, role });
    res.json(result);
  } catch (err) {
    handleUserError(err, res, next);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await userService.findPublicUserById(req.params.userId);
    res.json({ user });
  } catch (err) {
    handleUserError(err, res, next);
  }
}

async function updateMe(req, res, next) {
  try {
    const { username, email, faceLabel } = req.body || {};
    const user = await userService.updateProfile({
      userId: req.user.sub,
      username,
      email,
      faceLabel
    });

    res.json({ user });
  } catch (err) {
    handleUserError(err, res, next);
  }
}

async function changeMyPassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const result = await userService.changePassword({
      userId: req.user.sub,
      currentPassword,
      newPassword
    });

    res.json(result);
  } catch (err) {
    handleUserError(err, res, next);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body || {};
    const user = await userService.updateUserRole({
      targetUserId: req.params.userId,
      role
    });

    res.json({ user });
  } catch (err) {
    handleUserError(err, res, next);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
  listUsers,
  getUserById,
  updateMe,
  changeMyPassword,
  updateUserRole
};
