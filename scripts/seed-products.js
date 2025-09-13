const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const { Product } = require(path.join(__dirname, "../dist/models/Product.js"));
const { Category } = require(
  path.join(__dirname, "../dist/models/Category.js")
);
const { Vendor } = require(path.join(__dirname, "../dist/models/Vendor.js"));

const demoProducts = [
  {
    name: "Premium WordPress Theme - Business Pro",
    description:
      "A modern, responsive WordPress theme perfect for business websites. Features include drag-and-drop page builder, SEO optimization, mobile-first design, and 24/7 support.",
    price: 45000,
    originalPrice: 60000,
    discountPercentage: 25,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/business-pro-theme.zip",
    fileSize: 2048,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/business-pro-preview.jpg",
    thumbnail:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop",
    ],
    tags: ["wordpress", "theme", "business", "responsive"],
    features: [
      "Drag & Drop Builder",
      "SEO Optimized",
      "Mobile First",
      "24/7 Support",
    ],
    requirements: "WordPress 5.0+, PHP 7.4+",
    instructions: "Upload theme files via WordPress admin panel",
    licenseType: "MULTIPLE_USE",
    licenseDuration: 365,
    downloadLimit: 5,
    soldCount: 127,
    rating: 4.2,
    slug: "premium-wordpress-theme-business-pro",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 500,
    downloadCount: 127,
    reviewCount: 50,
  },
  {
    name: "Complete Digital Marketing Course",
    description:
      "Master digital marketing from basics to advanced strategies. Covers SEO, social media marketing, email campaigns, Google Ads, and analytics. Includes 50+ hours of video content and practical assignments.",
    price: 75000,
    originalPrice: 90000,
    discountPercentage: 16.67,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/digital-marketing-course.zip",
    fileSize: 10240,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/digital-marketing-preview.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1557838923-2985c318be48?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    ],
    tags: ["marketing", "course", "digital", "seo"],
    features: ["SEO Training", "Social Media", "Google Ads", "Analytics"],
    requirements: "Basic computer skills, internet access",
    instructions: "Extract zip and follow included guide",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 89,
    rating: 3.9,
    slug: "complete-digital-marketing-course",
    isDigital: true,
    isActive: true,
    isFeatured: true,
    viewCount: 300,
    downloadCount: 89,
    reviewCount: 35,
  },
  {
    name: "Professional Logo Design Pack",
    description:
      "Collection of 50+ professional logo templates in vector format. Perfect for startups, businesses, and freelancers. Includes AI, SVG, and PSD files with unlimited commercial use license.",
    price: 25000,
    originalPrice: 35000,
    discountPercentage: 28.57,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/logo-design-pack.zip",
    fileSize: 5120,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/logo-design-preview.pdf",
    thumbnail:
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop",
    ],
    tags: ["logo", "design", "vector", "templates"],
    features: [
      "Vector Formats",
      "Editable Files",
      "Commercial License",
      "50+ Designs",
    ],
    requirements: "Adobe Illustrator or compatible software",
    instructions: "Edit files in vector software and export as needed",
    licenseType: "UNLIMITED",
    licenseDuration: null,
    downloadLimit: -1,
    soldCount: 203,
    rating: 4.0,
    slug: "professional-logo-design-pack",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 600,
    downloadCount: 203,
    reviewCount: 80,
  },
  {
    name: "E-commerce Website Template",
    description:
      "Complete e-commerce solution built with React and Node.js. Features include shopping cart, payment integration, admin dashboard, inventory management, and mobile responsive design.",
    price: 120000,
    originalPrice: 150000,
    discountPercentage: 20,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/ecommerce-template.zip",
    fileSize: 15360,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/ecommerce-template-demo.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    ],
    tags: ["ecommerce", "react", "nodejs", "template"],
    features: [
      "Shopping Cart",
      "Payment Integration",
      "Admin Dashboard",
      "Responsive Design",
    ],
    requirements: "Node.js, React, MongoDB",
    instructions: "Follow setup guide in README file",
    licenseType: "MULTIPLE_USE",
    licenseDuration: 365,
    downloadLimit: 5,
    soldCount: 67,
    rating: 3.7,
    slug: "ecommerce-website-template",
    isDigital: true,
    isActive: true,
    isFeatured: true,
    viewCount: 250,
    downloadCount: 67,
    reviewCount: 25,
  },
  {
    name: "Financial Freedom Blueprint",
    description:
      "Comprehensive guide to achieving financial independence. Covers investment strategies, passive income streams, budgeting techniques, and wealth building principles for the African market.",
    price: 15000,
    originalPrice: 20000,
    discountPercentage: 25,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/financial-freedom.pdf",
    fileSize: 1024,
    fileType: "pdf",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/financial-freedom-preview.pdf",
    thumbnail:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&h=600&fit=crop",
    ],
    tags: ["finance", "investment", "wealth", "ebook"],
    features: [
      "Investment Strategies",
      "Passive Income",
      "Budgeting",
      "Wealth Building",
    ],
    requirements: "PDF reader",
    instructions: "Open PDF with any compatible reader",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 156,
    rating: 4.5,
    slug: "financial-freedom-blueprint",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 400,
    downloadCount: 156,
    reviewCount: 60,
  },
  {
    name: "Mobile App UI Kit",
    description:
      "Modern mobile app UI components for iOS and Android. Includes 200+ screens, icons, and components built with Figma. Perfect for designers and developers creating mobile applications.",
    price: 35000,
    originalPrice: 45000,
    discountPercentage: 22.22,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/mobile-ui-kit.fig",
    fileSize: 3072,
    fileType: "fig",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/mobile-ui-kit-preview.pdf",
    thumbnail:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop",
    ],
    tags: ["mobile", "ui", "figma", "design"],
    features: [
      "200+ Screens",
      "Editable Icons",
      "Figma Compatible",
      "iOS & Android",
    ],
    requirements: "Figma software",
    instructions: "Open and edit in Figma",
    licenseType: "MULTIPLE_USE",
    licenseDuration: 365,
    downloadLimit: 5,
    soldCount: 94,
    rating: 4.1,
    slug: "mobile-app-ui-kit",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 350,
    downloadCount: 94,
    reviewCount: 40,
  },
  {
    name: "Python Programming Masterclass",
    description:
      "Learn Python from beginner to advanced level. Covers web development, data science, automation, and machine learning. Includes 100+ coding exercises and real-world projects.",
    price: 55000,
    originalPrice: 70000,
    discountPercentage: 21.43,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/python-masterclass.zip",
    fileSize: 8192,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/python-masterclass-preview.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&h=600&fit=crop",
    ],
    tags: ["python", "programming", "course", "coding"],
    features: [
      "Web Development",
      "Data Science",
      "Automation",
      "Machine Learning",
    ],
    requirements: "Python 3.7+, IDE like VS Code",
    instructions: "Extract zip and follow course guide",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 178,
    rating: 3.8,
    slug: "python-programming-masterclass",
    isDigital: true,
    isActive: true,
    isFeatured: true,
    viewCount: 450,
    downloadCount: 178,
    reviewCount: 70,
  },
  {
    name: "Social Media Content Calendar",
    description:
      "Professional social media content calendar with 365 days of content ideas, hashtag strategies, and posting schedules. Includes templates for Instagram, Facebook, Twitter, and LinkedIn.",
    price: 18000,
    originalPrice: 25000,
    discountPercentage: 28,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/social-media-calendar.xlsx",
    fileSize: 512,
    fileType: "xlsx",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/social-media-calendar-preview.pdf",
    thumbnail:
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&h=600&fit=crop",
    ],
    tags: ["social media", "content", "calendar", "marketing"],
    features: [
      "Content Ideas",
      "Hashtag Strategies",
      "Posting Schedules",
      "Multi-Platform",
    ],
    requirements: "Microsoft Excel or Google Sheets",
    instructions: "Open in spreadsheet software and customize",
    licenseType: "MULTIPLE_USE",
    licenseDuration: 365,
    downloadLimit: 5,
    soldCount: 234,
    rating: 4.3,
    slug: "social-media-content-calendar",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 600,
    downloadCount: 234,
    reviewCount: 90,
  },
  {
    name: "Restaurant Management System",
    description:
      "Complete restaurant management solution with POS, inventory tracking, staff management, and reporting. Built with modern web technologies and includes mobile app for waiters.",
    price: 95000,
    originalPrice: 120000,
    discountPercentage: 20.83,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/restaurant-system.zip",
    fileSize: 20480,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/restaurant-system-demo.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    ],
    tags: ["restaurant", "pos", "management", "software"],
    features: [
      "POS System",
      "Inventory Tracking",
      "Staff Management",
      "Mobile App",
    ],
    requirements: "Node.js, MongoDB, modern browser",
    instructions: "Follow installation guide in README",
    licenseType: "SUBSCRIPTION",
    licenseDuration: 365,
    downloadLimit: 10,
    soldCount: 45,
    rating: 3.5,
    slug: "restaurant-management-system",
    isDigital: true,
    isActive: true,
    isFeatured: true,
    viewCount: 200,
    downloadCount: 45,
    reviewCount: 20,
  },
  {
    name: "Photography Lightroom Presets",
    description:
      "Professional Lightroom presets for portrait, landscape, and street photography. Includes 50+ presets with before/after examples and detailed installation instructions.",
    price: 22000,
    originalPrice: 30000,
    discountPercentage: 26.67,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/lightroom-presets.zip",
    fileSize: 1024,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/lightroom-presets-preview.pdf",
    thumbnail:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop",
    ],
    tags: ["photography", "lightroom", "presets", "editing"],
    features: [
      "50+ Presets",
      "Before/After Examples",
      "Installation Guide",
      "Multi-Genre",
    ],
    requirements: "Adobe Lightroom",
    instructions: "Import presets into Lightroom",
    licenseType: "MULTIPLE_USE",
    licenseDuration: 365,
    downloadLimit: 5,
    soldCount: 167,
    rating: 4.4,
    slug: "photography-lightroom-presets",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 450,
    downloadCount: 167,
    reviewCount: 65,
  },
  {
    name: "Startup Business Plan Template",
    description:
      "Comprehensive business plan template with financial projections, market analysis, and investor pitch deck. Includes 10+ industry-specific examples and step-by-step guidance.",
    price: 28000,
    originalPrice: 35000,
    discountPercentage: 20,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/business-plan-template.docx",
    fileSize: 512,
    fileType: "docx",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/business-plan-preview.pdf",
    thumbnail:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop",
    ],
    tags: ["business", "plan", "startup", "template"],
    features: [
      "Financial Projections",
      "Market Analysis",
      "Pitch Deck",
      "Examples",
    ],
    requirements: "Microsoft Word or compatible software",
    instructions: "Edit template in Word and customize",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 89,
    rating: 4.0,
    slug: "startup-business-plan-template",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 300,
    downloadCount: 89,
    reviewCount: 35,
  },
  {
    name: "JavaScript Framework Course",
    description:
      "Master modern JavaScript frameworks including React, Vue, and Angular. Learn state management, routing, and deployment strategies. Includes 80+ hours of video content and coding challenges.",
    price: 65000,
    originalPrice: 80000,
    discountPercentage: 18.75,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/javascript-frameworks.zip",
    fileSize: 12288,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/javascript-frameworks-preview.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=600&fit=crop",
    ],
    tags: ["javascript", "react", "vue", "angular"],
    features: [
      "State Management",
      "Routing",
      "Deployment",
      "Coding Challenges",
    ],
    requirements: "Basic JavaScript knowledge, modern browser",
    instructions: "Extract zip and follow course guide",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 134,
    rating: 3.6,
    slug: "javascript-framework-course",
    isDigital: true,
    isActive: true,
    isFeatured: true,
    viewCount: 400,
    downloadCount: 134,
    reviewCount: 50,
  },
  {
    name: "Real Estate Website Template",
    description:
      "Professional real estate website template with property listings, search filters, agent profiles, and contact forms. Built with modern web technologies and SEO optimized.",
    price: 85000,
    originalPrice: 100000,
    discountPercentage: 15,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/real-estate-template.zip",
    fileSize: 10240,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/real-estate-template-demo.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    ],
    tags: ["real estate", "website", "template", "property"],
    features: [
      "Property Listings",
      "Search Filters",
      "Agent Profiles",
      "SEO Optimized",
    ],
    requirements: "Node.js, modern browser",
    instructions: "Follow setup guide in README",
    licenseType: "MULTIPLE_USE",
    licenseDuration: 365,
    downloadLimit: 5,
    soldCount: 56,
    rating: 4.1,
    slug: "real-estate-website-template",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 250,
    downloadCount: 56,
    reviewCount: 25,
  },
  {
    name: "Fitness App Development Guide",
    description:
      "Complete guide to building a fitness tracking app. Covers UI/UX design, backend development, API integration, and app store deployment. Includes source code and design assets.",
    price: 75000,
    originalPrice: 90000,
    discountPercentage: 16.67,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/fitness-app-guide.zip",
    fileSize: 15360,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/fitness-app-guide-preview.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop",
    ],
    tags: ["fitness", "app", "development", "mobile"],
    features: [
      "UI/UX Design",
      "Backend Development",
      "API Integration",
      "App Store Deployment",
    ],
    requirements: "Basic coding skills, development environment",
    instructions: "Extract zip and follow guide",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 78,
    rating: 3.9,
    slug: "fitness-app-development-guide",
    isDigital: true,
    isActive: true,
    isFeatured: true,
    viewCount: 300,
    downloadCount: 78,
    reviewCount: 30,
  },
  {
    name: "Stock Market Trading Strategy",
    description:
      "Proven stock market trading strategies for beginners and intermediate traders. Includes technical analysis, risk management, and portfolio diversification techniques.",
    price: 32000,
    originalPrice: 40000,
    discountPercentage: 20,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/trading-strategy.pdf",
    fileSize: 1024,
    fileType: "pdf",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/trading-strategy-preview.pdf",
    thumbnail:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop",
    ],
    tags: ["trading", "stock market", "investment", "strategy"],
    features: [
      "Technical Analysis",
      "Risk Management",
      "Portfolio Diversification",
      "Beginner-Friendly",
    ],
    requirements: "PDF reader",
    instructions: "Open PDF with any compatible reader",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 112,
    rating: 4.2,
    slug: "stock-market-trading-strategy",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 350,
    downloadCount: 112,
    reviewCount: 45,
  },
  {
    name: "Advanced CSS Grid Layout Course",
    description:
      "Master CSS Grid Layout with comprehensive tutorials and real-world projects. Learn responsive design, complex layouts, and modern CSS techniques for professional web development.",
    price: 38000,
    originalPrice: 50000,
    discountPercentage: 24,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/css-grid-course.zip",
    fileSize: 8192,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/css-grid-course-preview.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=600&fit=crop",
    ],
    tags: ["css", "grid", "layout", "web design"],
    features: [
      "Responsive Design",
      "Complex Layouts",
      "CSS Techniques",
      "Real-World Projects",
    ],
    requirements: "Basic CSS knowledge, modern browser",
    instructions: "Extract zip and follow course guide",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 145,
    rating: 4.0,
    slug: "advanced-css-grid-layout-course",
    isDigital: true,
    isActive: true,
    isFeatured: true,
    viewCount: 400,
    downloadCount: 145,
    reviewCount: 55,
  },
  {
    name: "Cryptocurrency Investment Guide",
    description:
      "Complete guide to cryptocurrency investing and trading. Covers blockchain technology, portfolio management, risk assessment, and market analysis for digital assets.",
    price: 42000,
    originalPrice: 55000,
    discountPercentage: 23.64,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/crypto-investment-guide.pdf",
    fileSize: 1024,
    fileType: "pdf",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/crypto-investment-guide-preview.pdf",
    thumbnail:
      "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop",
    ],
    tags: ["cryptocurrency", "investment", "blockchain", "trading"],
    features: [
      "Blockchain Basics",
      "Portfolio Management",
      "Risk Assessment",
      "Market Analysis",
    ],
    requirements: "PDF reader",
    instructions: "Open PDF with any compatible reader",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 98,
    rating: 3.8,
    slug: "cryptocurrency-investment-guide",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 300,
    downloadCount: 98,
    reviewCount: 40,
  },
  {
    name: "Professional Email Templates Pack",
    description:
      "Collection of 100+ professional email templates for business communication. Includes sales emails, customer service, marketing campaigns, and follow-up templates.",
    price: 19000,
    originalPrice: 25000,
    discountPercentage: 24,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/email-templates-pack.zip",
    fileSize: 2048,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/email-templates-preview.pdf",
    thumbnail:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&h=600&fit=crop",
    ],
    tags: ["email", "templates", "business", "communication"],
    features: [
      "Sales Emails",
      "Customer Service",
      "Marketing Campaigns",
      "Follow-Ups",
    ],
    requirements: "Email client or marketing platform",
    instructions: "Import templates into email software",
    licenseType: "MULTIPLE_USE",
    licenseDuration: 365,
    downloadLimit: 5,
    soldCount: 267,
    rating: 4.4,
    slug: "professional-email-templates-pack",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 700,
    downloadCount: 267,
    reviewCount: 100,
  },
  {
    name: "Video Editing Masterclass",
    description:
      "Learn professional video editing with Adobe Premiere Pro and After Effects. Covers color grading, motion graphics, sound design, and advanced editing techniques.",
    price: 68000,
    originalPrice: 85000,
    discountPercentage: 20,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/video-editing-course.zip",
    fileSize: 12288,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/video-editing-course-preview.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    ],
    tags: ["video editing", "premiere pro", "after effects", "motion graphics"],
    features: [
      "Color Grading",
      "Motion Graphics",
      "Sound Design",
      "Advanced Editing",
    ],
    requirements: "Adobe Premiere Pro, After Effects",
    instructions: "Extract zip and follow course guide",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 87,
    rating: 4.3,
    slug: "video-editing-masterclass",
    isDigital: true,
    isActive: true,
    isFeatured: true,
    viewCount: 300,
    downloadCount: 87,
    reviewCount: 35,
  },
  {
    name: "Dropshipping Business Blueprint",
    description:
      "Complete guide to starting and scaling a dropshipping business. Covers product research, supplier management, marketing strategies, and automation tools.",
    price: 35000,
    originalPrice: 45000,
    discountPercentage: 22.22,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/dropshipping-blueprint.pdf",
    fileSize: 1024,
    fileType: "pdf",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/dropshipping-blueprint-preview.pdf",
    thumbnail:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop",
    ],
    tags: ["dropshipping", "ecommerce", "business", "entrepreneurship"],
    features: [
      "Product Research",
      "Supplier Management",
      "Marketing Strategies",
      "Automation Tools",
    ],
    requirements: "PDF reader",
    instructions: "Open PDF with any compatible reader",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 134,
    rating: 3.7,
    slug: "dropshipping-business-blueprint",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 400,
    downloadCount: 134,
    reviewCount: 50,
  },
  {
    name: "3D Modeling for Beginners",
    description:
      "Learn 3D modeling from scratch using Blender. Covers modeling, texturing, lighting, and rendering techniques for creating professional 3D assets.",
    price: 45000,
    originalPrice: 55000,
    discountPercentage: 18.18,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/3d-modeling-course.zip",
    fileSize: 8192,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/3d-modeling-course-preview.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    ],
    tags: ["3d modeling", "blender", "design", "animation"],
    features: ["Modeling", "Texturing", "Lighting", "Rendering"],
    requirements: "Blender software",
    instructions: "Extract zip and follow course guide",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 76,
    rating: 4.5,
    slug: "3d-modeling-for-beginners",
    isDigital: true,
    isActive: true,
    isFeatured: true,
    viewCount: 250,
    downloadCount: 76,
    reviewCount: 30,
  },
  {
    name: "Affiliate Marketing Mastery",
    description:
      "Complete affiliate marketing course covering niche selection, content creation, traffic generation, and conversion optimization strategies.",
    price: 29000,
    originalPrice: 35000,
    discountPercentage: 17.14,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/affiliate-marketing-course.zip",
    fileSize: 6144,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/affiliate-marketing-preview.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1557838923-2985c318be48?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=600&fit=crop",
    ],
    tags: [
      "affiliate marketing",
      "passive income",
      "content creation",
      "traffic",
    ],
    features: [
      "Niche Selection",
      "Content Creation",
      "Traffic Generation",
      "Conversion Optimization",
    ],
    requirements: "Basic internet skills",
    instructions: "Extract zip and follow course guide",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 189,
    rating: 3.9,
    slug: "affiliate-marketing-mastery",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 500,
    downloadCount: 189,
    reviewCount: 75,
  },
  {
    name: "Mobile Game Development Guide",
    description:
      "Learn to create mobile games using Unity and C#. Covers game design, programming, monetization strategies, and app store optimization.",
    price: 82000,
    originalPrice: 100000,
    discountPercentage: 18,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/mobile-game-dev-guide.zip",
    fileSize: 15360,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/mobile-game-dev-preview.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop",
    ],
    tags: ["game development", "unity", "mobile games", "programming"],
    features: [
      "Game Design",
      "C# Programming",
      "Monetization",
      "App Store Optimization",
    ],
    requirements: "Unity, basic C# knowledge",
    instructions: "Extract zip and follow guide",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 63,
    rating: 4.2,
    slug: "mobile-game-development-guide",
    isDigital: true,
    isActive: true,
    isFeatured: true,
    viewCount: 200,
    downloadCount: 63,
    reviewCount: 25,
  },
  {
    name: "Personal Branding Strategy",
    description:
      "Build a powerful personal brand online. Covers social media strategy, content creation, networking, and monetization techniques for influencers and professionals.",
    price: 26000,
    originalPrice: 35000,
    discountPercentage: 25.71,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/personal-branding-strategy.pdf",
    fileSize: 1024,
    fileType: "pdf",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/personal-branding-preview.pdf",
    thumbnail:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=600&fit=crop",
    ],
    tags: ["personal branding", "social media", "influencer", "marketing"],
    features: [
      "Social Media Strategy",
      "Content Creation",
      "Networking",
      "Monetization",
    ],
    requirements: "PDF reader",
    instructions: "Open PDF with any compatible reader",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 156,
    rating: 4.4,
    slug: "personal-branding-strategy",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 450,
    downloadCount: 156,
    reviewCount: 60,
  },
  {
    name: "Data Science Fundamentals",
    description:
      "Introduction to data science with Python. Covers statistics, machine learning, data visualization, and real-world data analysis projects.",
    price: 72000,
    originalPrice: 90000,
    discountPercentage: 20,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/data-science-course.zip",
    fileSize: 12288,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/data-science-course-preview.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=600&fit=crop",
    ],
    tags: ["data science", "python", "machine learning", "statistics"],
    features: [
      "Statistics",
      "Machine Learning",
      "Data Visualization",
      "Real-World Projects",
    ],
    requirements: "Python 3.7+, Jupyter Notebook",
    instructions: "Extract zip and follow course guide",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 94,
    rating: 3.8,
    slug: "data-science-fundamentals",
    isDigital: true,
    isActive: true,
    isFeatured: true,
    viewCount: 300,
    downloadCount: 94,
    reviewCount: 40,
  },
  {
    name: "Freelance Writing Masterclass",
    description:
      "Learn to write compelling content and build a successful freelance writing career. Covers copywriting, content marketing, client management, and portfolio building.",
    price: 31000,
    originalPrice: 40000,
    discountPercentage: 22.5,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/freelance-writing-course.zip",
    fileSize: 6144,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/freelance-writing-preview.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&h=600&fit=crop",
    ],
    tags: ["freelance writing", "copywriting", "content marketing", "writing"],
    features: [
      "Copywriting",
      "Content Marketing",
      "Client Management",
      "Portfolio Building",
    ],
    requirements: "Basic writing skills",
    instructions: "Extract zip and follow course guide",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 178,
    rating: 4.1,
    slug: "freelance-writing-masterclass",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 450,
    downloadCount: 178,
    reviewCount: 70,
  },
  {
    name: "SaaS Business Model Guide",
    description:
      "Complete guide to building and scaling a SaaS business. Covers product development, pricing strategies, customer acquisition, and growth hacking techniques.",
    price: 58000,
    originalPrice: 75000,
    discountPercentage: 22.67,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/saas-business-guide.pdf",
    fileSize: 1024,
    fileType: "pdf",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/saas-business-guide-preview.pdf",
    thumbnail:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop",
    ],
    tags: ["saas", "business model", "startup", "software"],
    features: [
      "Product Development",
      "Pricing Strategies",
      "Customer Acquisition",
      "Growth Hacking",
    ],
    requirements: "PDF reader",
    instructions: "Open PDF with any compatible reader",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 82,
    rating: 3.9,
    slug: "saas-business-model-guide",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 250,
    downloadCount: 82,
    reviewCount: 30,
  },
  {
    name: "UI/UX Design Principles",
    description:
      "Master UI/UX design principles and create user-centered digital experiences. Covers wireframing, prototyping, user research, and design systems.",
    price: 48000,
    originalPrice: 60000,
    discountPercentage: 20,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/ui-ux-design-course.zip",
    fileSize: 8192,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/ui-ux-design-course-preview.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop",
    ],
    tags: ["ui/ux", "design", "user experience", "prototyping"],
    features: ["Wireframing", "Prototyping", "User Research", "Design Systems"],
    requirements: "Basic design software knowledge",
    instructions: "Extract zip and follow course guide",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 123,
    rating: 4.5,
    slug: "ui-ux-design-principles",
    isDigital: true,
    isActive: true,
    isFeatured: true,
    viewCount: 350,
    downloadCount: 123,
    reviewCount: 50,
  },
  {
    name: "Podcast Production Masterclass",
    description:
      "Learn to create professional podcasts from recording to publishing. Covers equipment setup, audio editing, content strategy, and monetization methods.",
    price: 39000,
    originalPrice: 50000,
    discountPercentage: 22,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/podcast-production-course.zip",
    fileSize: 6144,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/podcast-production-preview.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&h=600&fit=crop",
    ],
    tags: ["podcast", "audio production", "content creation", "recording"],
    features: [
      "Equipment Setup",
      "Audio Editing",
      "Content Strategy",
      "Monetization",
    ],
    requirements: "Basic audio editing software",
    instructions: "Extract zip and follow course guide",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 67,
    rating: 4.0,
    slug: "podcast-production-masterclass",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 200,
    downloadCount: 67,
    reviewCount: 25,
  },
  {
    name: "E-commerce Analytics Dashboard",
    description:
      "Professional e-commerce analytics dashboard built with React and Chart.js. Tracks sales, customer behavior, inventory, and performance metrics.",
    price: 95000,
    originalPrice: 120000,
    discountPercentage: 20.83,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/ecommerce-dashboard.zip",
    fileSize: 10240,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/ecommerce-dashboard-demo.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    ],
    tags: ["analytics", "dashboard", "react", "ecommerce"],
    features: [
      "Sales Tracking",
      "Customer Behavior",
      "Inventory Management",
      "Performance Metrics",
    ],
    requirements: "Node.js, React, Chart.js",
    instructions: "Follow setup guide in README",
    licenseType: "SUBSCRIPTION",
    licenseDuration: 365,
    downloadLimit: 10,
    soldCount: 45,
    rating: 3.6,
    slug: "ecommerce-analytics-dashboard",
    isDigital: true,
    isActive: true,
    isFeatured: true,
    viewCount: 200,
    downloadCount: 45,
    reviewCount: 20,
  },
  {
    name: "Basic Website Template",
    description:
      "A simple, lightweight website template for small businesses. Includes basic HTML, CSS, and JavaScript with responsive design.",
    price: 15000,
    originalPrice: 20000,
    discountPercentage: 25,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/basic-website-template.zip",
    fileSize: 1024,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/basic-website-template-demo.html",
    thumbnail:
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    ],
    tags: ["website", "template", "html", "responsive"],
    features: ["HTML/CSS", "Responsive Design", "Lightweight", "Customizable"],
    requirements: "Basic HTML/CSS knowledge",
    instructions: "Extract zip and edit files",
    licenseType: "MULTIPLE_USE",
    licenseDuration: 365,
    downloadLimit: 5,
    soldCount: 45,
    rating: 3.2,
    slug: "basic-website-template",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 150,
    downloadCount: 45,
    reviewCount: 15,
  },
  {
    name: "Beginner Graphic Design Course",
    description:
      "Introduction to graphic design using Adobe Photoshop and Illustrator. Covers basic tools, color theory, and simple design projects.",
    price: 20000,
    originalPrice: 25000,
    discountPercentage: 20,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/graphic-design-course.zip",
    fileSize: 6144,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/graphic-design-course-preview.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1516321310762-479437144403?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1516321310762-479437144403?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&h=600&fit=crop",
    ],
    tags: ["graphic design", "photoshop", "illustrator", "course"],
    features: [
      "Basic Tools",
      "Color Theory",
      "Design Projects",
      "Beginner-Friendly",
    ],
    requirements: "Adobe Photoshop, Illustrator",
    instructions: "Extract zip and follow course guide",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 62,
    rating: 3.4,
    slug: "beginner-graphic-design-course",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 200,
    downloadCount: 62,
    reviewCount: 25,
  },
  {
    name: "Social Media Graphics Pack",
    description:
      "Collection of 20 social media graphics templates for Instagram and Facebook. Editable in Canva with basic customization options.",
    price: 12000,
    originalPrice: 15000,
    discountPercentage: 20,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/social-media-graphics.zip",
    fileSize: 2048,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/social-media-graphics-preview.pdf",
    thumbnail:
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=600&fit=crop",
    ],
    tags: ["social media", "graphics", "canva", "templates"],
    features: [
      "Editable in Canva",
      "Instagram & Facebook",
      "20 Templates",
      "Customizable",
    ],
    requirements: "Canva account",
    instructions: "Import into Canva and edit",
    licenseType: "MULTIPLE_USE",
    licenseDuration: 365,
    downloadLimit: 5,
    soldCount: 88,
    rating: 3.1,
    slug: "social-media-graphics-pack",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 250,
    downloadCount: 88,
    reviewCount: 30,
  },
  {
    name: "Budget Planner Template",
    description:
      "Simple budget planner template for personal finance. Includes spreadsheets for income tracking, expense categorization, and savings goals.",
    price: 10000,
    originalPrice: 15000,
    discountPercentage: 33.33,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/budget-planner.xlsx",
    fileSize: 256,
    fileType: "xlsx",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/budget-planner-preview.pdf",
    thumbnail:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop",
    ],
    tags: ["finance", "budget", "planner", "template"],
    features: [
      "Income Tracking",
      "Expense Categorization",
      "Savings Goals",
      "Spreadsheet",
    ],
    requirements: "Microsoft Excel or Google Sheets",
    instructions: "Open in spreadsheet software and customize",
    licenseType: "MULTIPLE_USE",
    licenseDuration: 365,
    downloadLimit: 5,
    soldCount: 76,
    rating: 3.3,
    slug: "budget-planner-template",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 200,
    downloadCount: 76,
    reviewCount: 25,
  },
  {
    name: "Basic Mobile App Template",
    description:
      "A basic mobile app template for startups. Includes minimal UI components and sample code for iOS and Android development.",
    price: 25000,
    originalPrice: 30000,
    discountPercentage: 16.67,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/mobile-app-template.zip",
    fileSize: 3072,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/mobile-app-template-demo.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop",
    ],
    tags: ["mobile", "app", "template", "ui"],
    features: ["Minimal UI", "iOS & Android", "Sample Code", "Customizable"],
    requirements: "Development environment for iOS/Android",
    instructions: "Extract zip and follow setup guide",
    licenseType: "MULTIPLE_USE",
    licenseDuration: 365,
    downloadLimit: 5,
    soldCount: 53,
    rating: 3.0,
    slug: "basic-mobile-app-template",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 150,
    downloadCount: 53,
    reviewCount: 20,
  },
  {
    name: "Intro to Coding with JavaScript",
    description:
      "Beginner-friendly course on JavaScript basics. Covers variables, functions, loops, and simple web interactions with 20+ coding exercises.",
    price: 18000,
    originalPrice: 22000,
    discountPercentage: 18.18,
    fileUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/javascript-intro-course.zip",
    fileSize: 4096,
    fileType: "zip",
    previewUrl:
      "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/javascript-intro-course-preview.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1516321310762-479437144403?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1516321310762-479437144403?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=600&fit=crop",
    ],
    tags: ["javascript", "coding", "course", "beginner"],
    features: ["Variables", "Functions", "Loops", "Coding Exercises"],
    requirements: "Basic computer skills, modern browser",
    instructions: "Extract zip and follow course guide",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 95,
    rating: 3.5,
    slug: "intro-to-coding-javascript",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 250,
    downloadCount: 95,
    reviewCount: 35,
  },
{
    name: "Event Planning Checklist",
    description: "Comprehensive event planning checklist for small events. Includes timelines, vendor contacts, and budget tracking templates.",
    price: 8000,
    originalPrice: 10000,
    discountPercentage: 20,
    fileUrl: "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/event-planning-checklist.pdf",
    fileSize: 256,
    fileType: "pdf",
    previewUrl: "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/event-planning-checklist-preview.pdf",
    thumbnail: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"
    ],
    tags: ["event planning", "checklist", "template", "organization"],
    features: ["Timelines", "Vendor Contacts", "Budget Tracking", "Customizable"],
    requirements: "PDF reader",
    instructions: "Open PDF with any compatible reader",
    licenseType: "MULTIPLE_USE",
    licenseDuration: 365,
    downloadLimit: 5,
    soldCount: 101,
    rating: 3.2,
    slug: "event-planning-checklist",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 250,
    downloadCount: 101,
    reviewCount: 40
  },
  {
    name: "Basic SEO Guide",
    description: "Introductory guide to search engine optimization. Covers keyword research, on-page SEO, and basic link-building strategies.",
    price: 14000,
    originalPrice: 18000,
    discountPercentage: 22.22,
    fileUrl: "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/seo-guide.pdf",
    fileSize: 512,
    fileType: "pdf",
    previewUrl: "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/seo-guide-preview.pdf",
    thumbnail: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&h=600&fit=crop"
    ],
    tags: ["seo", "marketing", "guide", "digital"],
    features: ["Keyword Research", "On-Page SEO", "Link Building", "Beginner-Friendly"],
    requirements: "PDF reader",
    instructions: "Open PDF with any compatible reader",
    licenseType: "SINGLE_USE",
    licenseDuration: 180,
    downloadLimit: 3,
    soldCount: 72,
    rating: 3.4,
    slug: "basic-seo-guide",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 200,
    downloadCount: 72,
    reviewCount: 30
  },
  {
    name: "Resume Template Pack",
    description: "Set of 10 professional resume templates for job seekers. Includes editable Word and PDF formats with modern designs.",
    price: 9000,
    originalPrice: 12000,
    discountPercentage: 25,
    fileUrl: "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/resume-template-pack.zip",
    fileSize: 512,
    fileType: "zip",
    previewUrl: "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/resume-template-pack-preview.pdf",
    thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d877c828f9?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1573496359142-b8d877c828f9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop"
    ],
    tags: ["resume", "template", "career", "job"],
    features: ["Editable Formats", "Modern Designs", "Word & PDF", "10 Templates"],
    requirements: "Microsoft Word or compatible software",
    instructions: "Extract zip and edit in Word or PDF editor",
    licenseType: "MULTIPLE_USE",
    licenseDuration: 365,
    downloadLimit: 5,
    soldCount: 120,
    rating: 3.3,
    slug: "resume-template-pack",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 300,
    downloadCount: 120,
    reviewCount: 45
  },
  {
    name: "Basic Video Editing Toolkit",
    description: "Starter toolkit for video editing with 10+ transitions and effects. Compatible with Adobe Premiere Pro and Final Cut Pro.",
    price: 16000,
    originalPrice: 20000,
    discountPercentage: 20,
    fileUrl: "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/files/video-editing-toolkit.zip",
    fileSize: 2048,
    fileType: "zip",
    previewUrl: "https://res.cloudinary.com/dmmz1qe2d/image/upload/v1755329755/vendorspot/products/previews/video-editing-toolkit-preview.mp4",
    thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    ],
    tags: ["video editing", "transitions", "effects", "toolkit"],
    features: ["10+ Transitions", "Effects Included", "Premiere Pro Compatible", "Final Cut Pro Compatible"],
    requirements: "Adobe Premiere Pro or Final Cut Pro",
    instructions: "Import into editing software",
    licenseType: "MULTIPLE_USE",
    licenseDuration: 365,
    downloadLimit: 5,
    soldCount: 69,
    rating: 3.1,
    slug: "basic-video-editing-toolkit",
    isDigital: true,
    isActive: true,
    isFeatured: false,
    viewCount: 200,
    downloadCount: 69,
    reviewCount: 25
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const categories = await Category.find({});
    const vendors = await Vendor.find({});

    if (categories.length === 0) {
      console.error("No categories found. Please run seed-categories first.");
      process.exit(1);
    }

    if (vendors.length === 0) {
      console.error("No vendors found. Please create a vendor first.");
      process.exit(1);
    }

    await Product.deleteMany({});
    console.log("Cleared existing products");

    const categoryMap = {
      "Web Templates": categories.find((c) => c.slug === "web-templates"),
      Graphics: categories.find((c) => c.slug === "graphics"),
      "E-books": categories.find((c) => c.slug === "ebooks"),
      Courses: categories.find((c) => c.slug === "courses"),
      Software: categories.find((c) => c.slug === "software"),
    };

    const vendor = vendors[0];
    const productsToCreate = [];

    demoProducts.forEach((product, index) => {
      let categoryId;

      if (
        product.tags.includes("wordpress") ||
        product.tags.includes("template") ||
        product.tags.includes("website")
      ) {
        categoryId = categoryMap["Web Templates"]?._id;
      } else if (
        product.tags.includes("design") ||
        product.tags.includes("logo") ||
        product.tags.includes("ui") ||
        product.tags.includes("photography")
      ) {
        categoryId = categoryMap["Graphics"]?._id;
      } else if (
        product.tags.includes("course") ||
        product.tags.includes("programming") ||
        product.tags.includes("marketing")
      ) {
        categoryId = categoryMap["Courses"]?._id;
      } else if (
        product.tags.includes("ebook") ||
        product.tags.includes("strategy") ||
        product.tags.includes("plan")
      ) {
        categoryId = categoryMap["E-books"]?._id;
      } else if (
        product.tags.includes("software") ||
        product.tags.includes("app") ||
        product.tags.includes("system")
      ) {
        categoryId = categoryMap["Software"]?._id;
      } else {
        categoryId = categoryMap["Web Templates"]?._id;
      }

      if (!categoryId) {
        console.warn(`No category found for product: ${product.name}`);
        categoryId = categories[0]._id;
      }

      productsToCreate.push({
        ...product,
        vendorId: vendor._id,
        categoryId: categoryId,
        isActive: true,
        isApproved: false,
        approvalStatus: "PENDING",
      });
    });

    const createdProducts = await Product.insertMany(productsToCreate);
    console.log(`Created ${createdProducts.length} products:`);

    createdProducts.forEach((product) => {
      console.log(`- ${product.name} (₦${product.price.toLocaleString()})`);
    });

    console.log("\nProducts seeded successfully!");
    console.log("Note: All products are set to isApproved: false by default.");
    console.log(
      "You can manually approve them in your database or create an admin script."
    );

    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
}

seedProducts();
