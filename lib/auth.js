import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { User } from "@/models/User";
import { connectDB } from "@/lib/db";

export function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("evolvv_token")?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();
    return User.findById(payload.id).select("-password");
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Admin access required");
  }
  return user;
}
