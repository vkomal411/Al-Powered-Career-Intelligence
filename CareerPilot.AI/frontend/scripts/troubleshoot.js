const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const frontendDir = path.join(__dirname, "..");
const nextDir = path.join(frontendDir, ".next");
const nodeModulesNext = path.join(frontendDir, "node_modules", ".cache");

console.log("==========================================");
console.log("  CAREERPILOT AUTO-TROUBLESHOOTING TOOL  ");
console.log("==========================================");

let issuesFixed = 0;

// 1. Clean .next directory
try {
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log("✓ Purged corrupt .next build directory.");
    issuesFixed++;
  }
} catch (err) {
  console.warn("⚠️ Could not remove .next directory:", err.message);
}

// 2. Clean node_modules cache
try {
  if (fs.existsSync(nodeModulesNext)) {
    fs.rmSync(nodeModulesNext, { recursive: true, force: true });
    console.log("✓ Purged node_modules/.cache folder.");
    issuesFixed++;
  }
} catch (err) {
  console.warn("⚠️ Could not remove node_modules/.cache:", err.message);
}

// 3. Verify node_modules installation
try {
  if (!fs.existsSync(path.join(frontendDir, "node_modules", "next"))) {
    console.log("⚙️ Next.js package missing, reinstalling dependencies...");
    execSync("npm install", { cwd: frontendDir, stdio: "inherit" });
    issuesFixed++;
  } else {
    console.log("✓ Verified node_modules/next installation.");
  }
} catch (err) {
  console.warn("⚠️ Dependency check warning:", err.message);
}

console.log("==========================================");
console.log(`✅ Auto-troubleshoot complete! (${issuesFixed} issues resolved)`);
console.log("👉 Run 'npm run dev' to start a clean dev server.");
console.log("==========================================");
