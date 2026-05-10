import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  try {
    const { items = [], address, paymentMethod = "razorpay" } = await request.json();
    if (!items.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    if (!["razorpay", "cod"].includes(paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    const orderItems = items.map(normalizeCartItem);
    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + 12;
    const user = await getCurrentUser();

    await connectDB();
    const order = await Order.create({
      user: user?._id,
      items: orderItems.map((item) => ({
        product: isObjectId(item.productId) ? item.productId : undefined,
        name: item.name,
        image: item.image,
        mockupImage: item.mockupImage || item.image,
        designImage: item.designImage,
        designName: item.designName,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        basePrice: item.basePrice,
        customizationFee: item.customizationFee,
        custom: Boolean(item.custom)
      })),
      address,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      status: paymentMethod === "cod" ? "processing" : "pending"
    });

    if (paymentMethod === "cod") {
      return NextResponse.json({ orderId: order._id.toString(), paymentMethod: "cod" });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay keys are missing." }, { status: 500 });
    }

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: Math.round(total * 100),
        currency: "INR",
        receipt: order._id.toString(),
        notes: {
          orderId: order._id.toString(),
          customerId: user?._id?.toString() || ""
        }
      })
    });

    const razorpayOrder = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      order.paymentStatus = "failed";
      await order.save();
      return NextResponse.json(
        { error: razorpayOrder.error?.description || "Could not create Razorpay order." },
        { status: razorpayResponse.status }
      );
    }

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return NextResponse.json({
      provider: "razorpay",
      keyId,
      orderId: order._id.toString(),
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Evolvv",
      description: "Evolvv order payment",
      customer: {
        name: address?.fullName || user?.name || "",
        email: user?.email || ""
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function isObjectId(value) {
  return typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
}

function normalizeCartItem(item) {
  const quantity = Math.max(1, Number(item.quantity || 1));
  const isCustom = Boolean(item.custom);
  const customizationFee = isCustom ? Number(item.customizationFee || 120) : Number(item.customizationFee || 0);
  const incomingPrice = Number(item.price || 0);
  const basePrice = isCustom
    ? Number(item.basePrice || Math.max(incomingPrice - Number(item.customizationFee || 0), 0))
    : Number(item.basePrice || incomingPrice);
  const price = isCustom ? Math.max(incomingPrice, basePrice + customizationFee) : incomingPrice;

  return {
    ...item,
    quantity,
    price,
    basePrice,
    customizationFee,
    custom: isCustom
  };
}
