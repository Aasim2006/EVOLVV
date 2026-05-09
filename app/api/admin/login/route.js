import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { User } from "@/models/User";

const fallbackAdminEmail = process.env.ADMIN_EMAIL || "admin@evolvv.com";
const fallbackAdminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const normalizedEmail = email?.toLowerCase().trim();

    await connectDB();
    let user = await User.findOne({ email: normalizedEmail });
    const valid = user ? await bcrypt.compare(password, user.password) : false;
    const validFallbackAdmin =
      normalizedEmail === fallbackAdminEmail.toLowerCase() && password === fallbackAdminPassword;

    if (validFallbackAdmin && (!user || user.role !== "admin" || !valid)) {
      user = await User.findOneAndUpdate(
        { email: normalizedEmail },
        {
          name: "Evolvv Admin",
          email: normalizedEmail,
          password: await bcrypt.hash(fallbackAdminPassword, 12),
          role: "admin"
        },
        { new: true, upsert: true }
      );
    }

    if ((!valid && !validFallbackAdmin) || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 401 });
    }

    const response = NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
    response.cookies.set("evolvv_token", signToken(user), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
