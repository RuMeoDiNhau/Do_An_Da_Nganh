"use strict";

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const PID_FILE = path.join(ROOT_DIR, ".server.pid");
const LOG_FILE = path.join(ROOT_DIR, ".server.log");

function readPidFile() {
  if (!fs.existsSync(PID_FILE)) {
    return null;
  }

  const raw = fs.readFileSync(PID_FILE, "utf8").trim();
  const pid = Number.parseInt(raw, 10);

  if (!Number.isInteger(pid) || pid <= 0) {
    return null;
  }

  return pid;
}

function writePidFile(pid) {
  fs.writeFileSync(PID_FILE, `${pid}\n`, "utf8");
}

function removePidFile() {
  if (fs.existsSync(PID_FILE)) {
    fs.unlinkSync(PID_FILE);
  }
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  ROOT_DIR,
  PID_FILE,
  LOG_FILE,
  readPidFile,
  writePidFile,
  removePidFile,
  isProcessAlive
};
