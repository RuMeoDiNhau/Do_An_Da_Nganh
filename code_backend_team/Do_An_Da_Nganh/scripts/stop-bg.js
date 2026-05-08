"use strict";

const {
  readPidFile,
  removePidFile,
  isProcessAlive
} = require("./process-meta");

const pid = readPidFile();

if (!pid) {
  console.log("No background server PID file found.");
  process.exit(0);
}

if (!isProcessAlive(pid)) {
  removePidFile();
  console.log(`Stale PID file removed. PID=${pid} is not running.`);
  process.exit(0);
}

try {
  process.kill(pid);
  removePidFile();
  console.log(`Background server stopped. PID=${pid}`);
} catch (err) {
  console.error(`Failed to stop PID=${pid}: ${err.message}`);
  process.exit(1);
}
