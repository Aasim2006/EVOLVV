import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Product } from "@/models/Product";
import mongoose from "mongoose";

export async function GET(_request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const lookup = mongoose.Types.ObjectId.isValid(id) ? { $or: [{ _id: id }, { slug: id }] } : { slug: id };
    const product = await Product.findOne(lookup);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const product = await Product.findByIdAndUpdate(id, normalizeProductBody(await request.json()), {
      new: true,
      runValidators: true
    });
    return NextResponse.json({ product });
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

export async function DELETE(_request, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    await Product.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
