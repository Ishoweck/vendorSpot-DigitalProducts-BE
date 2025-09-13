const mongoose = require("mongoose");
require("dotenv").config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("📦 Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model("Product", productSchema);

async function clearProducts() {
  try {
    console.log("🗑️  Starting products cleanup...");

    const count = await Product.countDocuments();
    console.log(`📊 Found ${count} products to delete`);

    if (count === 0) {
      console.log("✅ No products found to delete");
      return;
    }

    const result = await Product.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} products`);
  } catch (error) {
    console.error("❌ Error clearing products:", error.message);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    await clearProducts();
    console.log("🎉 Products cleanup completed successfully!");
  } catch (error) {
    console.error("💥 Cleanup failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("📦 MongoDB connection closed");
    process.exit(0);
  }
}

main();
