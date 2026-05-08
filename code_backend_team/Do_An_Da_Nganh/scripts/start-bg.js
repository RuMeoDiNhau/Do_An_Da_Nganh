"use strict";

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const {
  ROOT_DIR,
  LOG_FILE,
  readPidFile,
  writePidFile,
  removePidFile,
  isProcessAlive
} = require("./process-meta");

const existingPid = readPidFile();

if (existingPid && isProcessAlive(existingPid)) {
  console.log(`Server is already running in background. PID=${existingPid}`);
  process.exit(0);
}

if (existingPid) {
  removePidFile();
}

async function main() {
  const out = fs.openSync(LOG_FILE, "a");
  const err = fs.openSync(LOG_FILE, "a");
  const child = spawn(process.execPath, [path.join(ROOT_DIR, "server.js")], {
    cwd: ROOT_DIR,
    detached: true,
    stdio: ["ignore", out, err]
  });

  child.unref();
  writePidFile(child.pid);

  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (!isProcessAlive(child.pid)) {
    removePidFile();
    console.error("Background server exited right after start.");
    console.error(`Check log file: ${LOG_FILE}`);
    process.exit(1);
  }

  console.log(`Background server started. PID=${child.pid}`);
  console.log(`Log file: ${LOG_FILE}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
