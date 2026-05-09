import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { StoreSettings } from "@/models/StoreSettings";
import { User } from "@/models/User";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PATCH(request) {
  try {
    await requireAdmin();
    await connectDB();
    const body = await request.json();
    const settings = await getSettings();
    settings.storeName = body.storeName ?? settings.storeName;
    settings.supportEmail = body.supportEmail ?? settings.supportEmail;
    settings.bannerText = body.bannerText ?? settings.bannerText;
    settings.shippingFee = Number(body.shippingFee ?? settings.shippingFee);
    await settings.save();
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(request) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "admin") throw new Error("Admin access required");
    const { currentPassword, newPassword } = await request.json();
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(admin._id);
    const valid = await bcrypt.compare(currentPassword || "", user.password);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

async function getSettings() {
  let settings = await StoreSettings.findOne();
  if (!settings) settings = await StoreSettings.create({});
  return settings;
}
