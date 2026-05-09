"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { formatRupees } from "@/lib/currency";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  category: "Tees",
  stock: "",
  sizes: "S, M, L, XL",
  badge: "",
  image: ""
};

export default function AdminProductsClient() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const lowStock = products.filter((product) => Number(product.stock || 0) <= 5).length;

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const response = await fetch("/api/products", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setProducts(data.products || []);
    }
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "name" && !editing ? { slug: slugify(value) } : {})
    }));
  }

  async function saveProduct(event) {
    event.preventDefault();
    const body = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      stock: Number(form.stock),
      sizes: form.sizes.split(",").map((item) => item.trim()).filter(Boolean),
      badge: form.badge,
      images: form.image ? form.image.split(",").map((url) => ({ url: url.trim(), alt: form.name })) : []
    };

    const response = await fetch(editing ? `/api/products/${editing}` : "/api/products", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? "Product saved" : data.error || "Could not save product");
    if (response.ok) {
      setEditing(null);
      setForm(emptyForm);
      refresh();
    }
  }

  async function uploadImages(files) {
    const urls = [];
    for (const file of files) {
      const dataUri = await readFile(file);
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUri })
      });
      const data = await response.json();
      if (data.image?.url) urls.push(data.image.url);
      else if (data.error) setMessage(data.error);
    }
    if (urls.length) {
      setForm((current) => ({
        ...current,
        image: [current.image, ...urls].filter(Boolean).join(", ")
      }));
      setMessage(`${urls.length} image${urls.length === 1 ? "" : "s"} uploaded`);
    }
  }

  function edit(product) {
    setEditing(product._id);
    setForm({
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      price: product.price || "",
      category: product.category || "Tees",
      stock: product.stock || "",
      sizes: product.sizes?.join(", ") || "S, M, L, XL",
      badge: product.badge || "",
      image: product.images?.map((image) => image.url).filter(Boolean).join(", ") || ""
    });
  }

  async function remove(id) {
    const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
    setMessage(response.ok ? "Product deleted" : "Could not delete product");
    if (response.ok) refresh();
  }

  return (
    <AdminShell title="Products" badge={lowStock}>
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={saveProduct} className="h-fit border border-white/10 bg-smoke p-5">
          <h2 className="font-display text-2xl">{editing ? "Edit Product" : "Add Product"}</h2>
          {["name", "slug", "price", "stock", "badge"].map((field) => (
            <input
              key={field}
              name={field}
              value={form[field]}
              onChange={updateField}
              required={["name", "slug", "price", "stock"].includes(field)}
              placeholder={field}
              className="focus-ring mt-4 w-full border border-white/15 bg-ink px-4 py-3 text-bone placeholder:text-zinc-600"
            />
          ))}
          <select
            name="category"
            value={form.category}
            onChange={updateField}
            className="focus-ring mt-4 w-full border border-white/15 bg-ink px-4 py-3 text-bone"
          >
            {["Hoodies", "Tees", "Polo T-Shirts", "Caps"].map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
          <input
            name="sizes"
            value={form.sizes}
            onChange={updateField}
            placeholder="S, M, L, XL"
            className="focus-ring mt-4 w-full border border-white/15 bg-ink px-4 py-3 text-bone placeholder:text-zinc-600"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={updateField}
            required
            placeholder="description"
            className="focus-ring mt-4 min-h-28 w-full border border-white/15 bg-ink px-4 py-3 text-bone placeholder:text-zinc-600"
          />
          <textarea
            name="image"
            value={form.image}
            onChange={updateField}
            placeholder="image URLs, comma separated"
            className="focus-ring mt-4 min-h-20 w-full border border-white/15 bg-ink px-4 py-3 text-bone placeholder:text-zinc-600"
          />
          <label
            onDrop={(event) => {
              event.preventDefault();
              uploadImages(Array.from(event.dataTransfer.files || []));
            }}
            onDragOver={(event) => event.preventDefault()}
            className="mt-4 block cursor-pointer border border-dashed border-white/20 p-5 text-center text-sm text-zinc-400 transition hover:border-white/40"
          >
            Drag images here or click to upload
            <input type="file" multiple accept="image/*" className="hidden" onChange={(event) => uploadImages(Array.from(event.target.files || []))} />
          </label>
          <button className="focus-ring mt-5 w-full bg-bone px-5 py-4 text-sm font-bold uppercase tracking-[0.22em] text-ink">
            {editing ? "Update Product" : "Create Product"}
          </button>
          {editing ? (
            <button type="button" onClick={() => { setEditing(null); setForm(emptyForm); }} className="mt-3 w-full text-sm text-zinc-400 underline">
              Cancel edit
            </button>
          ) : null}
          {message ? <p className="mt-4 text-sm text-zinc-400">{message}</p> : null}
        </form>
        <div className="overflow-x-auto border border-white/10 bg-smoke p-5">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              <tr><th className="py-3">Product</th><th>Category</th><th>Stock</th><th>Price</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-t border-white/10">
                  <td className="py-4">{product.name}</td>
                  <td>{product.category}</td>
                  <td className={Number(product.stock || 0) <= 5 ? "text-red-300" : "text-zinc-400"}>{product.stock}</td>
                  <td>{formatRupees(product.price)}</td>
                  <td className="space-x-4">
                    <button onClick={() => edit(product)} className="underline">Edit</button>
                    <button onClick={() => remove(product._id)} className="text-red-300 underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
