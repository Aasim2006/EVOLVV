const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const envPath = path.join(process.cwd(), ".env.local");

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^([^#=\s]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is required");
}

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "customer" }
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    description: String,
    price: Number,
    category: String,
    sizes: [String],
    stock: Number,
    images: [{ url: String, alt: String }],
    badge: String,
    isFeatured: Boolean
  },
  { timestamps: true }
);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  const User = mongoose.models.User || mongoose.model("User", userSchema);
  const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

  await User.findOneAndUpdate(
    { email: "admin@evolvv.com" },
    {
      name: "Evolvv Admin",
      email: "admin@evolvv.com",
      password: await bcrypt.hash("ChangeMe123!", 12),
      role: "admin"
    },
    { upsert: true }
  );

  await Product.deleteMany({});
  await Product.insertMany([
    {
      name: "Beige Evolvv Hoodie",
      slug: "beige-evolvv-hoodie",
      description: "Premium beige hoodie with soft heavyweight fleece, clean Evolvv branding, and a relaxed streetwear fit.",
      price: 600,
      category: "Hoodies",
      sizes: ["S", "M", "L", "XL"],
      stock: 24,
      images: [
        { url: "/products/beige-hoodie-1.png", alt: "Beige Evolvv Hoodie front" },
        { url: "/products/beige-hoodie-2.png", alt: "Beige Evolvv Hoodie back" },
        { url: "/products/beige-hoodie-3.png", alt: "Beige Evolvv Hoodie front and back" }
      ],
      badge: "New",
      isFeatured: true
    },
    {
      name: "Navy Evolvv Hoodie",
      slug: "navy-evolvv-hoodie",
      description: "Premium navy hoodie with soft heavyweight fleece, clean Evolvv branding, and a relaxed streetwear fit.",
      price: 600,
      category: "Hoodies",
      sizes: ["S", "M", "L", "XL"],
      stock: 18,
      images: [
        { url: "/products/navy-hoodie-1.png", alt: "Navy Evolvv Hoodie front" },
        { url: "/products/navy-hoodie-2.png", alt: "Navy Evolvv Hoodie back" },
        { url: "/products/navy-hoodie-3.png", alt: "Navy Evolvv Hoodie front and back" }
      ],
      badge: "Drop 01",
      isFeatured: true
    },
    {
      name: "Black Evolvv Hoodie",
      slug: "black-evolvv-hoodie",
      description: "Premium black hoodie with soft heavyweight fleece, clean Evolvv branding, and a relaxed streetwear fit.",
      price: 600,
      category: "Hoodies",
      sizes: ["S", "M", "L", "XL"],
      stock: 21,
      images: [
        { url: "/products/black-hoodie-1.png", alt: "Black Evolvv Hoodie front" },
        { url: "/products/black-hoodie-2.png", alt: "Black Evolvv Hoodie back" },
        { url: "/products/black-hoodie-3.png", alt: "Black Evolvv Hoodie front and back" }
      ],
      badge: "Core",
      isFeatured: true
    },
    {
      name: "White Evolvv Oversized Tee",
      slug: "white-evolvv-tee",
      description: "Premium white oversized tee with bold Evolvv branding and relaxed proportions.",
      price: 400,
      category: "Tees",
      sizes: ["S", "M", "L", "XL"],
      stock: 36,
      images: [
        { url: "/products/white-tee-1.png", alt: "White Evolvv Oversized Tee front" },
        { url: "/products/white-tee-2.png", alt: "White Evolvv Oversized Tee back" },
        { url: "/products/white-tee-3.png", alt: "White Evolvv Oversized Tee front and back" }
      ],
      badge: "Core",
      isFeatured: true
    },
    {
      name: "Black Evolvv Oversized Tee",
      slug: "black-evolvv-tee",
      description: "Premium black oversized tee with bold Evolvv branding and relaxed proportions.",
      price: 400,
      category: "Tees",
      sizes: ["S", "M", "L", "XL"],
      stock: 34,
      images: [
        { url: "/products/black-tee-1.png", alt: "Black Evolvv Oversized Tee front" },
        { url: "/products/black-tee-2.png", alt: "Black Evolvv Oversized Tee back" },
        { url: "/products/black-tee-3.png", alt: "Black Evolvv Oversized Tee front and back" }
      ],
      badge: "Core",
      isFeatured: true
    },
    {
      name: "Off White Evolvv Oversized Tee",
      slug: "off-white-evolvv-tee",
      description: "Premium off white oversized tee with bold Evolvv branding and relaxed proportions.",
      price: 400,
      category: "Tees",
      sizes: ["S", "M", "L", "XL"],
      stock: 29,
      images: [
        { url: "/products/off-white-tee-1.png", alt: "Off White Evolvv Oversized Tee front" },
        { url: "/products/off-white-tee-2.png", alt: "Off White Evolvv Oversized Tee back" },
        { url: "/products/off-white-tee-3.png", alt: "Off White Evolvv Oversized Tee front and back" }
      ],
      badge: "Limited",
      isFeatured: true
    },
    {
      name: "Brown Evolvv Oversized Tee",
      slug: "brown-evolvv-tee",
      description: "Premium brown oversized tee with bold Evolvv branding and relaxed proportions.",
      price: 400,
      category: "Tees",
      sizes: ["S", "M", "L", "XL"],
      stock: 26,
      images: [
        { url: "/products/brown-tee-1.png", alt: "Brown Evolvv Oversized Tee front" },
        { url: "/products/brown-tee-2.png", alt: "Brown Evolvv Oversized Tee back" },
        { url: "/products/brown-tee-3.png", alt: "Brown Evolvv Oversized Tee front and back" }
      ],
      badge: "Limited",
      isFeatured: true
    },
    {
      name: "Black Evolvv Polo T-Shirt",
      slug: "black-evolvv-polo-t-shirt",
      description: "Premium black polo t-shirt with a clean collar, sharp Evolvv branding, and a polished streetwear fit.",
      price: 500,
      category: "Polo T-Shirts",
      sizes: ["S", "M", "L", "XL"],
      stock: 20,
      images: [
        { url: "/products/black-polo-1.png", alt: "Black Evolvv Polo T-Shirt front" },
        { url: "/products/black-polo-2.png", alt: "Black Evolvv Polo T-Shirt back" },
        { url: "/products/black-polo-3.png", alt: "Black Evolvv Polo T-Shirt front and back" }
      ],
      badge: "Premium",
      isFeatured: true
    },
    {
      name: "Navy Evolvv Polo T-Shirt",
      slug: "navy-evolvv-polo-t-shirt",
      description: "Premium navy polo t-shirt with a clean collar, sharp Evolvv branding, and a polished streetwear fit.",
      price: 500,
      category: "Polo T-Shirts",
      sizes: ["S", "M", "L", "XL"],
      stock: 22,
      images: [
        { url: "/products/navy-polo-1.png", alt: "Navy Evolvv Polo T-Shirt front" },
        { url: "/products/navy-polo-2.png", alt: "Navy Evolvv Polo T-Shirt back" },
        { url: "/products/navy-polo-3.png", alt: "Navy Evolvv Polo T-Shirt front and back" }
      ],
      badge: "Premium",
      isFeatured: true
    },
    {
      name: "Evolvv Cap",
      slug: "evolvv-cap",
      description: "Clean Evolvv cap with a structured crown and easy everyday fit.",
      price: 250,
      category: "Caps",
      sizes: ["One Size"],
      stock: 40,
      images: [
        { url: "/products/cap-1.jpg", alt: "Evolvv Cap view 1" },
        { url: "/products/cap-2.png", alt: "Evolvv Cap view 2" },
        { url: "/products/cap-2.jpg", alt: "Evolvv Cap view 3" }
      ],
      badge: "Accessory",
      isFeatured: true
    }
  ]);

  await mongoose.disconnect();
  console.log("Seeded Evolvv products and admin user.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
