import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
    const { productId, rating, comment } = await request.json();
    await connectDB();
    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    product.reviews.push({ user: user._id, name: user.name, rating, comment });
    await product.save();
    return NextResponse.json({ reviews: product.reviews });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
