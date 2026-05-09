import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    await connectDB();
    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      orders
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
