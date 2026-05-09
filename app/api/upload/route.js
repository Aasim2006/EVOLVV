import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(request) {
  try {
    await requireAdmin();
    const { dataUri } = await request.json();
    if (!dataUri) return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ image: { url: dataUri, alt: "Uploaded product image" } });
    }
    const image = await uploadImage(dataUri);
    return NextResponse.json({ image });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
