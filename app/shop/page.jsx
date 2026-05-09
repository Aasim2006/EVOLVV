import ShopClient from "@/components/ShopClient";
import { featuredProducts } from "@/lib/sample-data";

export default function ShopPage() {
  return <ShopClient initialProducts={featuredProducts} />;
}
