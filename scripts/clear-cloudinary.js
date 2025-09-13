const { v2: cloudinary } = require("cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function clearVendorspotFolder() {
  try {
    console.log("🗑️  Starting Cloudinary cleanup for vendorspot folder...");

    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "vendorspot/",
      max_results: 500,
    });

    if (result.resources.length === 0) {
      console.log("✅ No files found in vendorspot folder");
      return;
    }

    console.log(`📁 Found ${result.resources.length} files to delete`);

    const publicIds = result.resources.map((resource) => resource.public_id);

    const deleteResult = await cloudinary.api.delete_resources(publicIds);

    console.log("✅ Deletion completed:");
    console.log(`   - Deleted: ${Object.keys(deleteResult.deleted).length}`);
    console.log(
      `   - Not found: ${Object.keys(deleteResult.not_found || {}).length}`
    );

    try {
      await cloudinary.api.delete_folder("vendorspot");
      console.log("✅ Vendorspot folder deleted");
    } catch (folderError) {
      console.log(
        "ℹ️  Folder deletion skipped (may not be empty or may not exist)"
      );
    }
  } catch (error) {
    console.error("❌ Error clearing Cloudinary:", error.message);
    process.exit(1);
  }
}

// Run the cleanup
clearVendorspotFolder()
  .then(() => {
    console.log("🎉 Cloudinary cleanup completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Cleanup failed:", error);
    process.exit(1);
  });
