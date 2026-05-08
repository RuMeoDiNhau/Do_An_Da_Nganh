"use strict";

const bcrypt = require("bcryptjs");
const { prisma } = require("../config/database");
const {
  issueTokenPair,
  verifyRefreshToken,
  revokeAccessByPayload,
  revokeRefreshByPayload
} = require("./token.service");
const { publicUser } = require("./user.service");

function normalizeEmail(email) {
  if (typeof email !== "string") return null;
  const v = email.trim();
  return v || null;
}

function normalizeUsername(username, displayName) {
  if (typeof username === "string" && username.trim()) return username.trim();
  if (typeof displayName === "string" && displayName.trim()) return displayName.trim();
  return "";
}

async function register({ username, email, password, faceLabel, displayName }) {
  const resolvedUsername = normalizeUsername(username, displayName);
  const normalizedEmail = normalizeEmail(email);

  if (!resolvedUsername || !password) throw new Error("username and password are required");
  if (String(password).length < 6) throw new Error("password must be at least 6 characters");

  const where = [{ username: resolvedUsername }];
  if (normalizedEmail) where.push({ email: normalizedEmail });

  const exists = await prisma.users.findFirst({
    where: { OR: where }
  });
  if (exists) throw new Error("username or email already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.users.create({
    data: {
      username: resolvedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
      face_label: typeof faceLabel === "string" ? faceLabel.trim() || null : null
    }
  });

  return publicUser(user);
}

async function login({ username, email, identifier, password }) {
  const loginId = String(identifier || username || email || "").trim();
  if (!loginId || !password) throw new Error("username/email and password are required");

  const user = await prisma.users.findFirst({
    where: {
      OR: [{ username: loginId }, { email: loginId }]
    }
  });
  if (!user) throw new Error("invalid credentials");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error("invalid credentials");

  const tokens = issueTokenPair(user);
  return { ...tokens, user: publicUser(user) };
}

async function refresh({ refreshToken }) {
  if (!refreshToken) throw new Error("refreshToken is required");

  const payload = verifyRefreshToken(refreshToken);
  revokeRefreshByPayload(payload);

  const user = await prisma.users.findUnique({ where: { u_id: payload.sub } });
  if (!user) throw new Error("user not found");

  const tokens = issueTokenPair(user);
  return { ...tokens, user: publicUser(user) };
}

function logout({ accessPayload, refreshToken }) {
  if (accessPayload) revokeAccessByPayload(accessPayload);

  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      revokeRefreshByPayload(payload);
    } catch (err) {
      // Ignore invalid/expired refresh token during logout.
    }
  }

  return { ok: true };
}

module.exports = { register, login, refresh, logout };
