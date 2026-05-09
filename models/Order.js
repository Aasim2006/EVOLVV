import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customer: {
      name: String,
      email: String,
      phone: String
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        image: String,
        size: String,
        quantity: Number,
        price: Number
      }
    ],
    address: {
      fullName: String,
      line1: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    total: Number,
    paymentMethod: { type: String, enum: ["razorpay", "cod"], default: "razorpay" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled", "paid"],
      default: "pending"
    },
    razorpayOrderId: String,
    razorpayPaymentId: String
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
