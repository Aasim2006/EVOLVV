import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { User } from "@/models/User";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const [orders, customerCount, productCount, lowStockProducts] = await Promise.all([
      Order.find({}).populate("user", "name email").sort({ createdAt: -1 }).lean(),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments({}),
      Product.find({ stock: { $lte: 5 } }).select("name stock").lean()
    ]);

    const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const bestSellersMap = new Map();
    for (const order of orders) {
      for (const item of order.items || []) {
        const current = bestSellersMap.get(item.name) || { name: item.name, quantity: 0, revenue: 0 };
        current.quantity += Number(item.quantity || 0);
        current.revenue += Number(item.quantity || 0) * Number(item.price || 0);
        bestSellersMap.set(item.name, current);
      }
    }

    const monthly = Array.from({ length: 6 }, (_, offset) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - offset));
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return { key, label: date.toLocaleString("en", { month: "short" }), revenue: 0, orders: 0 };
    });

    for (const order of orders) {
      const date = new Date(order.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const month = monthly.find((item) => item.key === key);
      if (month) {
        month.revenue += Number(order.total || 0);
        month.orders += 1;
      }
    }

    return NextResponse.json({
      totals: {
        orders: orders.length,
        revenue,
        customers: customerCount,
        products: productCount,
        pendingOrders: orders.filter((order) => ["pending", "processing"].includes(order.status)).length
      },
      recentOrders: orders.slice(0, 8),
      bestSellers: Array.from(bestSellersMap.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 6),
      lowStockProducts,
      monthly
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
