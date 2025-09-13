const { execSync } = require("child_process");
const path = require("path");

console.log("🧹 Starting complete cleanup...");
console.log("");

try {
  console.log("1️⃣  Clearing products from MongoDB...");
  execSync("node scripts/clear-products.js", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });

  console.log("");

  console.log("2️⃣  Clearing Cloudinary vendorspot folder...");
  execSync("node scripts/clear-cloudinary.js", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });

  console.log("");
  console.log("🎉 Complete cleanup finished successfully!");
} catch (error) {
  console.error("💥 Cleanup failed:", error.message);
  process.exit(1);
}
