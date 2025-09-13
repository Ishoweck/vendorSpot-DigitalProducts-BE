const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const { Category } = require(path.join(__dirname, "../dist/models/Category.js"));

const categories = [
  {
    name: "Web Templates",
    slug: "web-templates",
    description: "Professional website templates and themes",
    sortOrder: 1,
  },
  {
    name: "Graphics",
    slug: "graphics",
    description: "Digital graphics, logos, and design assets",
    sortOrder: 2,
  },
  {
    name: "E-books",
    slug: "ebooks",
    description: "Digital books and educational content",
    sortOrder: 3,
  },
  {
    name: "Courses",
    slug: "courses",
    description: "Online courses and training materials",
    sortOrder: 4,
  },
  {
    name: "Software",
    slug: "software",
    description: "Digital software and applications",
    sortOrder: 5,
  },
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    await Category.deleteMany({});
    console.log("Cleared existing categories");

    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories:`);

    createdCategories.forEach((cat) => {
      console.log(`- ${cat.name} (${cat._id})`);
    });

    console.log("Categories seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();
