"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatRupees } from "@/lib/currency";

export default function CartClient() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const [signedIn, setSignedIn] = useState(false);
  const shipping = subtotal > 0 ? 12 : 0;
  const total = subtotal + shipping;

  useEffect(() => {
    async function checkAccount() {
      const response = await fetch("/api/account", { cache: "no-store" }).catch(() => null);
      setSignedIn(Boolean(response?.ok));
    }

    checkAccount();
  }, []);

  return (
    <section className="min-h-screen bg-ink px-5 pb-24 pt-32 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <h1 className="font-display text-5xl text-bone md:text-7xl">Cart</h1>
          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {items.length === 0 ? (
              <p className="py-12 text-zinc-400">Your cart is empty.</p>
            ) : (
              items.map((item) => (
                <div key={item.key} className="grid gap-4 py-6 sm:grid-cols-[120px_1fr_auto]">
                  <div className="relative aspect-square overflow-hidden bg-smoke">
                    {item.image?.startsWith("data:image/") ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                    ) : (
                      <Image src={item.image || "/product-tee.svg"} alt={item.name} fill className="object-cover" />
                    )}
                  </div>
                  <div>
                    <Link
                      href={item.href || (item.custom ? "/image-generator" : `/product/${item.slug || item.productId}`)}
                      className="font-display text-xl text-bone transition hover:text-white hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm text-zinc-500">Size {item.size}</p>
                    {item.custom ? <p className="mt-1 text-sm text-zinc-500">Custom back print</p> : null}
                    <button onClick={() => removeItem(item.key)} className="mt-4 text-sm text-zinc-400 underline">
                      Remove
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="luxury-border h-10 w-10" onClick={() => updateQuantity(item.key, item.quantity - 1)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button className="luxury-border h-10 w-10" onClick={() => updateQuantity(item.key, item.quantity + 1)}>
                      +
                    </button>
                    <p className="w-24 text-right font-semibold">{formatRupees(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <aside className="h-fit border border-white/10 bg-smoke p-6">
          <h2 className="font-display text-2xl">Order Summary</h2>
          <Line label="Subtotal" value={formatRupees(subtotal)} />
          <Line label="Shipping" value={formatRupees(shipping)} />
          <div className="mt-5 flex justify-between border-t border-white/10 pt-5 text-xl font-semibold">
            <span>Total</span>
            <span>{formatRupees(total)}</span>
          </div>
          {signedIn ? (
            <Link
              href="/checkout"
              className="focus-ring mt-6 block bg-bone px-5 py-4 text-center text-sm font-bold uppercase tracking-[0.22em] text-ink"
            >
              Checkout
            </Link>
          ) : (
            <div className="mt-6 border border-white/10 bg-ink p-4">
              <p className="text-sm text-zinc-400">Login or create an account to checkout.</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link
                  href="/login?next=/checkout"
                  className="focus-ring bg-bone px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.18em] text-ink"
                >
                  Login
                </Link>
                <Link
                  href="/signup?next=/checkout"
                  className="focus-ring border border-white/15 px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.18em] text-bone"
                >
                  Signup
                </Link>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function Line({ label, value }) {
  return (
    <div className="mt-5 flex justify-between text-zinc-400">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
