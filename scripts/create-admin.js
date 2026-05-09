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
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@evolvv.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe123!";

if (!MONGODB_URI) throw new Error("MONGODB_URI is required");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true, trim: true },
    password: String,
    role: { type: String, enum: ["customer", "admin"], default: "customer" }
  },
  { timestamps: true }
);

async function createAdmin() {
  await mongoose.connect(MONGODB_URI);
  const User = mongoose.models.User || mongoose.model("User", userSchema);
  await User.findOneAndUpdate(
    { email: ADMIN_EMAIL.toLowerCase() },
    {
      name: "Evolvv Admin",
      email: ADMIN_EMAIL.toLowerCase(),
      password: await bcrypt.hash(ADMIN_PASSWORD, 12),
      role: "admin"
    },
    { upsert: true }
  );
  await mongoose.disconnect();
  console.log(`Admin user ready: ${ADMIN_EMAIL}`);
}

createAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
