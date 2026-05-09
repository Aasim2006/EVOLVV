"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatRupees } from "@/lib/currency";

export default function ProductDetails({ product }) {
  const [size, setSize] = useState(product.sizes?.[0] || "M");
  const { items, addItem, updateQuantity } = useCart();
  const cartKey = `${product._id}-${size}`;
  const cartItem = items.find((item) => item.key === cartKey);
  const galleryImages = (product.images || [])
    .map((image) => (typeof image === "string" ? image : image?.url))
    .filter(Boolean);
  const images = galleryImages.length ? galleryImages : [product.image || "/product-tee.svg"];
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <section className="min-h-screen bg-ink px-5 pb-24 pt-32 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="flex min-h-[520px] items-center justify-center overflow-hidden border border-white/10 bg-white p-6 md:min-h-[680px]">
            <img
              src={selectedImage}
              alt={product.name}
              className="max-h-[680px] max-w-full object-contain"
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedImage(image)}
                className={`focus-ring flex aspect-[4/5] items-center justify-center overflow-hidden border bg-white p-2 transition ${
                  selectedImage === image ? "border-bone" : "border-white/10 hover:border-white/40"
                }`}
                aria-label={`View ${product.name} image ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>
        <div className="lg:pt-10">
          <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">{product.category}</p>
          <h1 className="mt-4 font-display text-5xl text-bone md:text-7xl">{product.name}</h1>
          <p className="mt-5 text-2xl font-semibold">{formatRupees(product.price)}</p>
          <p className="mt-8 max-w-xl text-lg leading-8 text-zinc-400">
            {product.description ||
              "A premium monochrome staple cut for daily movement, designed with heavyweight comfort and Evolvv's quiet edge."}
          </p>

          <div className="mt-10">
            <p className="mb-3 text-sm uppercase tracking-[0.25em] text-zinc-500">Size</p>
            <div className="grid grid-cols-4 gap-3">
              {product.sizes?.map((item) => (
                <button
                  key={item}
                  onClick={() => setSize(item)}
                  className={`focus-ring border px-5 py-4 text-sm font-bold transition ${
                    size === item
                      ? "border-bone bg-bone text-ink"
                      : "border-white/15 text-bone hover:border-white/40"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {cartItem ? (
            <div className="mt-8 grid h-[52px] w-full grid-cols-[56px_1fr_56px] bg-bone text-ink">
              <button
                type="button"
                onClick={() => updateQuantity(cartKey, cartItem.quantity - 1)}
                className="focus-ring text-2xl font-semibold transition hover:bg-white"
                aria-label={`Remove one ${product.name} from cart`}
              >
                -
              </button>
              <span className="flex items-center justify-center border-x border-ink/15 text-sm font-bold uppercase tracking-[0.25em]">
                {cartItem.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(cartKey, cartItem.quantity + 1)}
                className="focus-ring text-2xl font-semibold transition hover:bg-white"
                aria-label={`Add one more ${product.name} to cart`}
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => addItem(product, size)}
              className="focus-ring mt-8 w-full bg-bone px-8 py-4 text-sm font-bold uppercase tracking-[0.25em] text-ink transition hover:bg-white"
            >
              Add to cart
            </button>
          )}

          <div className="mt-10 border-t border-white/10 pt-8">
            <h2 className="font-display text-2xl">Description</h2>
            <p className="mt-3 text-zinc-400">
              Relaxed luxury streetwear with reinforced seams, oversized energy, and a black-and-white palette that works from studio to street.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
