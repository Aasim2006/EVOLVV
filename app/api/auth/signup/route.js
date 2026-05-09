import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { User } from "@/models/User";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    const normalizedEmail = email?.toLowerCase().trim();
    if (!name || !normalizedEmail || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (!emailPattern.test(normalizedEmail)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    await connectDB();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 409 });

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12)
    });

    const response = NextResponse.json({ user: { id: user._id, name: user.name, email: user.email } });
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
