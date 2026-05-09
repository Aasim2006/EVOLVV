"use client";

import { useEffect, useMemo, useState } from "react";
import ProductGrid from "@/components/ProductGrid";

const categories = ["All", "Hoodies", "Tees", "Polo T-Shirts", "Caps"];
const sizes = ["All", "S", "M", "L", "XL"];

export default function ShopClient({ initialProducts }) {
  const [sourceProducts, setSourceProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [size, setSize] = useState("All");

  useEffect(() => {
    fetch("/api/products")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.products?.length) {
          const products = data.products.map(normalizeProduct).filter((product) => product.name);
          if (products.length >= initialProducts.length) {
            setSourceProducts(products);
          }
        }
      })
      .catch(() => {});
  }, [initialProducts.length]);

  const products = useMemo(() => {
    return sourceProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "All" || product.category === category;
      const matchesSize = size === "All" || product.sizes?.includes(size);
      return matchesSearch && matchesCategory && matchesSize;
    });
  }, [sourceProducts, query, category, size]);

  return (
    <section className="min-h-screen bg-ink px-5 pb-24 pt-32 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">Shop</p>
            <h1 className="mt-3 font-display text-5xl text-bone md:text-7xl">Streetwear</h1>
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pieces"
            className="focus-ring w-full border border-white/15 bg-smoke px-4 py-3 text-sm text-bone placeholder:text-zinc-600 md:w-80"
          />
        </div>

        <div className="mb-10 grid gap-4 border-y border-white/10 py-5 md:grid-cols-2">
          <Filter label="Category" value={category} onChange={setCategory} options={categories} />
          <Filter label="Size" value={size} onChange={setSize} options={sizes} />
        </div>

        <ProductGrid products={products} />
      </div>
    </section>
  );
}

function normalizeProduct(product) {
  const images = (product.images || [])
    .map((image) => (typeof image === "string" ? image : image?.url))
    .filter(Boolean);

  return {
    ...product,
    _id: product._id?.toString(),
    sizes: product.sizes?.length ? product.sizes : ["S", "M", "L", "XL"],
    image: product.image || images[0] || "/product-tee.svg",
    images: images.length ? images : [product.image || "/product-tee.svg"]
  };
}

function Filter({ label, value, onChange, options }) {
  return (
    <label className="text-sm text-zinc-400">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring mt-2 w-full border border-white/15 bg-smoke px-4 py-3 text-bone"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
