"use strict";

// Placeholder for YOLO/face-recognition flows.
// Keep AI code out of request handlers; expose functions for controllers/services.

async function analyzeFrame(_frameBytes) {
  // TODO: integrate your model pipeline
  return { ok: true, detections: [] };
}

module.exports = { analyzeFrame };
