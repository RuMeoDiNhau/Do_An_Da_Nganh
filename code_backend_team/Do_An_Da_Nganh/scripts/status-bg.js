"use strict";

const {
  PID_FILE,
  LOG_FILE,
  readPidFile,
  removePidFile,
  isProcessAlive
} = require("./process-meta");

const pid = readPidFile();

if (!pid) {
  console.log("Background server is not running.");
  console.log(`PID file: ${PID_FILE}`);
  process.exit(0);
}

if (!isProcessAlive(pid)) {
  removePidFile();
  console.log(`Background server is not running, but PID file still exists. PID=${pid}`);
  console.log("Stale PID file has been removed.");
  process.exit(0);
}

console.log(`Background server is running. PID=${pid}`);
console.log(`PID file: ${PID_FILE}`);
console.log(`Log file: ${LOG_FILE}`);
