"use strict";

const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const revokedAccessJtis = new Map();
const refreshSessions = new Map();

function nowSec() {
  return Math.floor(Date.now() / 1000);
}

function envOrDefault(name, fallback) {
  return process.env[name] || fallback;
}

function getVerifyOptions() {
  const options = {};

  if (process.env.JWT_ISSUER) options.issuer = process.env.JWT_ISSUER;
  if (process.env.JWT_AUDIENCE) options.audience = process.env.JWT_AUDIENCE;

  return options;
}

function getSignOptions(expiresIn) {
  const options = { expiresIn };

  if (process.env.JWT_ISSUER) options.issuer = process.env.JWT_ISSUER;
  if (process.env.JWT_AUDIENCE) options.audience = process.env.JWT_AUDIENCE;

  return options;
}

function cleanupStores() {
  const now = nowSec();

  for (const [jti, exp] of revokedAccessJtis.entries()) {
    if (exp <= now) revokedAccessJtis.delete(jti);
  }

  for (const [jti, session] of refreshSessions.entries()) {
    if (session.exp <= now) refreshSessions.delete(jti);
  }
}

function createAccessPayload(user, jti) {
  return {
    sub: user.u_id,
    username: user.username,
    email: user.email,
    role: user.role,
    type: "access",
    jti
  };
}

function createRefreshPayload(user, jti) {
  return {
    sub: user.u_id,
    type: "refresh",
    jti
  };
}

function signAccessToken(user) {
  cleanupStores();

  const jti = crypto.randomUUID();
  const payload = createAccessPayload(user, jti);
  const secret = envOrDefault("JWT_SECRET", "change_me");
  const expiresIn = envOrDefault("JWT_EXPIRES_IN", "15m");

  const token = jwt.sign(payload, secret, getSignOptions(expiresIn));
  const decoded = jwt.decode(token);

  return { token, jti, exp: decoded?.exp || 0 };
}

function signRefreshToken(user) {
  cleanupStores();

  const jti = crypto.randomUUID();
  const payload = createRefreshPayload(user, jti);
  const secret = envOrDefault("JWT_REFRESH_SECRET", envOrDefault("JWT_SECRET", "change_me"));
  const expiresIn = envOrDefault("JWT_REFRESH_EXPIRES_IN", "7d");

  const token = jwt.sign(payload, secret, getSignOptions(expiresIn));
  const decoded = jwt.decode(token);

  refreshSessions.set(jti, {
    sub: user.u_id,
    exp: decoded?.exp || 0
  });

  return { token, jti, exp: decoded?.exp || 0 };
}

function verifyAccessToken(token) {
  cleanupStores();

  const payload = jwt.verify(token, envOrDefault("JWT_SECRET", "change_me"), getVerifyOptions());
  if (payload?.type !== "access") throw new Error("invalid token type");
  if (!payload?.jti) throw new Error("token missing jti");
  if (revokedAccessJtis.has(payload.jti)) throw new Error("token revoked");

  return payload;
}

function verifyRefreshToken(token) {
  cleanupStores();

  const payload = jwt.verify(
    token,
    envOrDefault("JWT_REFRESH_SECRET", envOrDefault("JWT_SECRET", "change_me")),
    getVerifyOptions()
  );

  if (payload?.type !== "refresh") throw new Error("invalid token type");
  if (!payload?.jti) throw new Error("token missing jti");

  const session = refreshSessions.get(payload.jti);
  if (!session) throw new Error("refresh token revoked");
  if (session.sub !== payload.sub) throw new Error("refresh token mismatch");

  return payload;
}

function revokeAccessByPayload(payload) {
  cleanupStores();

  if (!payload?.jti) return;
  if (!payload?.exp) return;

  revokedAccessJtis.set(payload.jti, payload.exp);
}

function revokeRefreshByPayload(payload) {
  cleanupStores();

  if (!payload?.jti) return;
  refreshSessions.delete(payload.jti);
}

function issueTokenPair(user) {
  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);

  return {
    accessToken: access.token,
    refreshToken: refresh.token,
    tokenType: "Bearer",
    expiresAt: access.exp
  };
}

module.exports = {
  issueTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  revokeAccessByPayload,
  revokeRefreshByPayload
};