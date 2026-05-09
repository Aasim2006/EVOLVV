import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { User } from "@/models/User";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const normalizedEmail = email?.toLowerCase().trim();
    await connectDB();
    const user = await User.findOne({ email: normalizedEmail });
    const valid = user ? await bcrypt.compare(password, user.password) : false;

    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

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
