import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  try {
    const {
      orderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature
    } = await request.json();

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Razorpay secret is missing." }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    const user = await getCurrentUser();
    await connectDB();

    const order = await Order.findOneAndUpdate(
      { _id: orderId, razorpayOrderId, user: user?._id },
      {
        razorpayPaymentId,
        paymentStatus: "paid",
        status: "paid"
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, orderId: order._id.toString() });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Payment verification failed." }, { status: 500 });
  }
}
