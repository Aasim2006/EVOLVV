import { notFound } from "next/navigation";
import ProductDetails from "@/components/ProductDetails";
import { featuredProducts } from "@/lib/sample-data";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";

export default async function ProductPage({ params }) {
  const { id } = await params;
  let product = featuredProducts.find((item) => item.slug === id || item._id === id);

  if (!product && process.env.MONGODB_URI) {
    await connectDB();
    const dbProduct = await Product.findOne({ slug: id }).lean();
    if (dbProduct) {
      product = {
        name: dbProduct.name,
        slug: dbProduct.slug,
        description: dbProduct.description,
        price: dbProduct.price,
        category: dbProduct.category,
        sizes: dbProduct.sizes,
        badge: dbProduct.badge,
        _id: dbProduct._id.toString(),
        image: dbProduct.images?.[0]?.url
      };
    }
  }

  if (!product) notFound();

  return <ProductDetails product={product} />;
}
