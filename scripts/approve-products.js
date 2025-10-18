const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const { Product } = require(path.join(__dirname, "../dist/models/Product.js"));

async function approveProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const result = await Product.updateMany(
      { isApproved: false },
      { 
        isApproved: true, 
        approvalStatus: "APPROVED" 
      }
    );

    console.log(`Approved ${result.modifiedCount} products`);

    
    console.log("All products are now approved and visible on the frontend!");
    
    process.exit(0);
  } catch (error) {
    console.error("Error approving products:", error);
    process.exit(1);
  }
}

approveProducts(); 