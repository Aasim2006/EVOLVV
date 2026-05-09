import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";

const allowedStatuses = new Set(["pending", "processing", "shipped", "delivered", "cancelled"]);

export async function GET(_request, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const order = await Order.findById(id).populate("user", "name email").lean();
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const { status, paymentStatus } = await request.json();
    const update = {};
    if (allowedStatuses.has(status)) update.status = status;
    if (["pending", "paid", "failed", "refunded"].includes(paymentStatus)) update.paymentStatus = paymentStatus;
    const order = await Order.findByIdAndUpdate(id, update, { new: true }).populate("user", "name email");
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
