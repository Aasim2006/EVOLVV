import mongoose from "mongoose";

const storeSettingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "EVOLVV" },
    supportEmail: { type: String, default: "" },
    bannerText: { type: String, default: "Wear the Change" },
    shippingFee: { type: Number, default: 12 }
  },
  { timestamps: true }
);

export const StoreSettings =
  mongoose.models.StoreSettings || mongoose.model("StoreSettings", storeSettingsSchema);
