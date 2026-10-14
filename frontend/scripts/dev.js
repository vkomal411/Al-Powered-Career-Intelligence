const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const nextDir = path.join(__dirname, "..", ".next");
const fallbackManifest = path.join(nextDir, "fallback-build-manifest.json");
const buildManifest = path.join(nextDir, "build-manifest.json");

function ensureManifests() {
  try {
    if (!fs.existsSync(nextDir)) {
      fs.mkdirSync(nextDir, { recursive: true });
    }
    const defaultManifest = JSON.stringify({ pages: { "/_app": [] } }, null, 2);
    if (!fs.existsSync(fallbackManifest)) {
      fs.writeFileSync(fallbackManifest, defaultManifest);
    }
    if (!fs.existsSync(buildManifest)) {
      fs.writeFileSync(buildManifest, defaultManifest);
    }
  } catch {
    // Ignore temporary lock conflicts
  }
}

function cleanCache() {
  try {
    if (fs.existsSync(nextDir)) {
      fs.rmSync(nextDir, { recursive: true, force: true });
      console.log("🧹 [Self-Healing Dev] Cleared stale .next directory.");
    }
  } catch (err) {
    console.warn("⚠️ Cleanup note:", err.message);
  }
  ensureManifests();
}

// 1. Initial cleanup and manifest guard
cleanCache();

// 2. Active background self-healing guard: prevents ENOENT errors if .next is modified mid-run
setInterval(ensureManifests, 1000);

function startDev() {
  console.log("🚀 Starting CareerPilot Next.js Dev Server (Auto Self-Healing Enabled)...");
  const child = spawn("npx", ["next", "dev"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" }
  });

  child.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.warn(`⚠️ Dev server exited (code ${code}). Running auto-troubleshoot cleanup...`);
      cleanCache();
    }
  });
}

startDev();
