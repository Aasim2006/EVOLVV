import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Product } from "@/models/Product";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const query = {};
    if (searchParams.get("category")) query.category = searchParams.get("category");
    if (searchParams.get("q")) query.name = { $regex: searchParams.get("q"), $options: "i" };
    const products = await Product.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    await connectDB();
    const body = normalizeProductBody(await request.json());
    const product = await Product.create(body);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

function normalizeProductBody(body) {
  return {
    ...body,
    slug: body.slug || body.name?.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
    price: Number(body.price || 0),
    stock: Number(body.stock || 0),
    sizes: body.sizes?.length ? body.sizes : ["S", "M", "L", "XL"],
    images: (body.images || []).filter((image) => image.url)
  };
}
