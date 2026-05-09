import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { User } from "@/models/User";

export async function GET(request) {
  try {
    await requireAdmin();
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const query = { role: "customer" };
    if (q) query.$or = [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }];

    const users = await User.find(query).select("-password").sort({ createdAt: -1 }).lean();
    const orders = await Order.find({ user: { $in: users.map((user) => user._id) } }).lean();
    const customers = users.map((user) => {
      const customerOrders = orders.filter((order) => String(order.user) === String(user._id));
      return {
        ...user,
        orderCount: customerOrders.length,
        totalSpent: customerOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
        orders: customerOrders.slice(0, 5)
      };
    });

    return NextResponse.json({ customers });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
