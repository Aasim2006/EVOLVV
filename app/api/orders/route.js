import { NextResponse } from "next/server";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";

export async function GET() {
  try {
    const admin = await requireAdmin();
    await connectDB();
    const orders = await Order.find({}).populate("user", "name email").sort({ createdAt: -1 });
    return NextResponse.json({ admin: admin.email, orders });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    await connectDB();
    const order = await Order.create({ ...body, user: user?._id });
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
