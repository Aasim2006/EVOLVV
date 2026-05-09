"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/components/CartProvider";
import { formatRupees } from "@/lib/currency";

export default function ProductCard({ product }) {
  const { items, addItem, updateQuantity } = useCart();
  const defaultSize = product.sizes?.[0] || "M";
  const cartKey = `${product._id}-${defaultSize}`;
  const cartItem = items.find((item) => item.key === cartKey);
  const galleryImages = (product.images || [])
    .map((image) => (typeof image === "string" ? image : image?.url))
    .filter(Boolean);
  const image = product.image || galleryImages[0] || "/product-tee.svg";
  const hoverImage = galleryImages[1] || galleryImages[2] || image;
  const href = product.slug ? `/product/${product.slug}` : `/product/${product._id}`;

  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25 }}
      className="group luxury-border bg-smoke"
    >
      <Link href={href} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-graphite">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
          />
          {hoverImage !== image ? (
            <Image
              src={hoverImage}
              alt={`${product.name} alternate view`}
              fill
              className="object-cover opacity-0 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
            />
          ) : null}
          {product.badge ? (
            <span className="absolute left-4 top-4 bg-bone px-3 py-1 text-xs font-bold uppercase text-ink">
              {product.badge}
            </span>
          ) : null}
        </div>
      </Link>
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg text-bone">{product.name}</h3>
            <p className="mt-1 text-sm text-zinc-500">{product.category}</p>
          </div>
          <p className="text-sm font-semibold">{formatRupees(product.price)}</p>
        </div>
        {cartItem ? (
          <div className="grid h-[46px] grid-cols-[46px_1fr_46px] border border-white/20 text-bone">
            <button
              type="button"
              onClick={() => updateQuantity(cartKey, cartItem.quantity - 1)}
              className="focus-ring text-xl transition hover:bg-bone hover:text-ink"
              aria-label={`Remove one ${product.name} from cart`}
            >
              -
            </button>
            <span className="flex items-center justify-center border-x border-white/20 text-sm font-bold">
              {cartItem.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(cartKey, cartItem.quantity + 1)}
              className="focus-ring text-xl transition hover:bg-bone hover:text-ink"
              aria-label={`Add one more ${product.name} to cart`}
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => addItem(product, defaultSize)}
            className="focus-ring w-full border border-white/20 px-4 py-3 text-sm uppercase tracking-[0.2em] text-bone transition hover:bg-bone hover:text-ink"
          >
            Add to cart
          </button>
        )}
      </div>
    </motion.article>
  );
}
