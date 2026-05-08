"use strict";

function roleMiddleware(allowedRoles) {
  const allowed = new Set(Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]);
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !allowed.has(role)) return res.status(403).json({ error: "Forbidden" });
    return next();
  };
}

module.exports = { roleMiddleware };