"use strict";

const bcrypt = require("bcryptjs");
const { prisma } = require("../config/database");

function publicUser(user) {
  return {
    u_id: user.u_id,
    username: user.username,
    email: user.email,
    role: user.role,
    face_label: user.face_label
  };
}

async function findPublicUserById(userId) {
  const user = await prisma.users.findUnique({ where: { u_id: userId } });
  if (!user) throw new Error("user not found");

  return publicUser(user);
}

async function listUsers({ page = 1, pageSize = 20, search = "", role }) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 20));

  const where = {};

  if (search) {
    where.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } }
    ];
  }

  if (role) {
    where.role = role;
  }

  const [items, total] = await Promise.all([
    prisma.users.findMany({
      where,
      orderBy: { username: "asc" },
      skip: (safePage - 1) * safePageSize,
      take: safePageSize
    }),
    prisma.users.count({ where })
  ]);

  return {
    items: items.map(publicUser),
    meta: {
      page: safePage,
      pageSize: safePageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / safePageSize))
    }
  };
}

async function updateProfile({ userId, username, email, faceLabel }) {
  const user = await prisma.users.findUnique({ where: { u_id: userId } });
  if (!user) throw new Error("user not found");

  const data = {};
  if (typeof username === "string" && username.trim()) data.username = username.trim();
  if (typeof email === "string") data.email = email.trim() || null;
  if (typeof faceLabel === "string") data.face_label = faceLabel.trim() || null;

  if (Object.keys(data).length === 0) throw new Error("no updatable fields");

  if (data.username || data.email !== undefined) {
    const ors = [];
    if (data.username) ors.push({ username: data.username });
    if (data.email !== undefined && data.email !== null) ors.push({ email: data.email });

    if (ors.length > 0) {
      const conflict = await prisma.users.findFirst({
        where: {
          OR: ors,
          NOT: { u_id: userId }
        }
      });
      if (conflict) throw new Error("username or email already exists");
    }
  }

  const updated = await prisma.users.update({
    where: { u_id: userId },
    data
  });

  return publicUser(updated);
}

async function changePassword({ userId, currentPassword, newPassword }) {
  if (!currentPassword || !newPassword) throw new Error("currentPassword and newPassword are required");
  if (String(newPassword).length < 6) throw new Error("newPassword must be at least 6 characters");

  const user = await prisma.users.findUnique({ where: { u_id: userId } });
  if (!user) throw new Error("user not found");

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) throw new Error("current password is incorrect");

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.users.update({
    where: { u_id: userId },
    data: { password: hashed }
  });

  return { ok: true };
}

function getAllowedRoles() {
  const raw = process.env.AUTH_ALLOWED_ROLES || "user,admin";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function updateUserRole({ targetUserId, role }) {
  if (!role) throw new Error("role is required");

  const allowed = getAllowedRoles();
  if (!allowed.includes(role)) {
    throw new Error(`role must be one of: ${allowed.join(", ")}`);
  }

  const user = await prisma.users.findUnique({ where: { u_id: targetUserId } });
  if (!user) throw new Error("user not found");

  const updated = await prisma.users.update({
    where: { u_id: targetUserId },
    data: { role }
  });

  return publicUser(updated);
}

module.exports = {
  publicUser,
  findPublicUserById,
  listUsers,
  updateProfile,
  changePassword,
  updateUserRole
};