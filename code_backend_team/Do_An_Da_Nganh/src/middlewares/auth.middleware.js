"use strict";

const { verifyAccessToken } = require("../services/token.service");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    req.accessToken = token;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { authMiddleware };
