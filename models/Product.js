import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    rating: { type: Number, min: 1, max: 5, default: 5 },
    comment: { type: String, trim: true }
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    sizes: [{ type: String, enum: ["XS", "S", "M", "L", "XL", "XXL", "One Size"] }],
    stock: { type: Number, default: 0 },
    images: [
      {
        url: String,
        publicId: String,
        alt: String
      }
    ],
    badge: String,
    reviews: [reviewSchema],
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
