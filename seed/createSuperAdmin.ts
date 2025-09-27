// seedSuperAdmin.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../../backend/src/models/User"; // Adjust the path based on your project structure
// import logger from "../../"; // Optional: if you have a logger

dotenv.config();

const createSuperAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI!;
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    const existingAdmin = await User.findOne({ role: "SUPERADMIN" });

    if (existingAdmin) {
      console.log("⚠️ Super Admin already exists:", existingAdmin.email);
      return process.exit(0);
    }

    const adminEmail = process.env.SUPER_ADMIN_EMAIL || "superadmin@example.com";
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || "SuperSecurePassword123";
    const adminFirstName = "Super";
    const adminLastName = "Admin";

    const superAdmin = await User.create({
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      firstName: adminFirstName,
      lastName: adminLastName,
      role: "SUPERADMIN",
      isEmailVerified: true,
      isPhoneVerified: true,
    });

    console.log("✅ Super Admin created:", superAdmin.email);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating Super Admin:", error);
    process.exit(1);
  }
};

createSuperAdmin();
