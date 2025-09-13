const mongoose = require("mongoose");
require("dotenv").config();

async function clearUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const result = await mongoose.connection.db
      .collection("users")
      .deleteMany({});
    console.log(`Deleted ${result.deletedCount} users`);

    const vendorResult = await mongoose.connection.db
      .collection("vendors")
      .deleteMany({});
    console.log(`Deleted ${vendorResult.deletedCount} vendors`);

    console.log("Database cleared successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error clearing database:", error);
    process.exit(1);
  }
}

clearUsers();
