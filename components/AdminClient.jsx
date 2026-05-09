"use client";

import { useEffect, useState } from "react";
import { formatRupees } from "@/lib/currency";

export default function AdminClient() {
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: "",
    price: "",
    stock: "",
    sizes: "S, M, L, XL",
    image: "",
    description: ""
  });

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const productResponse = await fetch("/api/products").catch(() => null);
    if (productResponse?.ok) {
      const data = await productResponse.json();
      setProducts(data.products || []);
    }

    const orderResponse = await fetch("/api/orders").catch(() => null);
    if (orderResponse?.ok) {
      const data = await orderResponse.json();
      setOrders(data.orders || []);
    }
  }

  async function handleProduct(event) {
    event.preventDefault();
    const body = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      sizes: form.sizes.split(",").map((item) => item.trim()),
      images: form.image ? [{ url: form.image, alt: form.name }] : []
    };
    const response = await fetch(editing ? `/api/products/${editing}` : "/api/products", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    setMessage(response.ok ? "Product saved" : "Admin login required");
    if (response.ok) {
      setEditing(null);
      await refresh();
    }
  }

  async function deleteProduct(id) {
    const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
    setMessage(response.ok ? "Product deleted" : "Admin login required");
    if (response.ok) refresh();
  }

  function editProduct(product) {
    setEditing(product._id);
    setForm({
      name: product.name || "",
      slug: product.slug || "",
      category: product.category || "",
      price: product.price || "",
      stock: product.stock || "",
      sizes: product.sizes?.join(", ") || "S, M, L, XL",
      image: product.images?.[0]?.url || "",
      description: product.description || ""
    });
  }

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function uploadProductImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUri: reader.result })
      });
      const data = await response.json();
      if (data.image?.url) {
        setForm((current) => ({ ...current, image: data.image.url }));
        setMessage("Image uploaded");
      } else {
        setMessage(data.error || "Upload failed");
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <section className="min-h-screen bg-ink px-5 pb-24 pt-32 md:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">Admin</p>
        <h1 className="mt-3 font-display text-5xl text-bone md:text-7xl">Manage Drop</h1>
        <form onSubmit={handleProduct} className="mt-10 grid gap-4 border border-white/10 bg-smoke p-6 md:grid-cols-2">
          {["name", "slug", "category", "price", "stock", "sizes", "image"].map((field) => (
            <input
              key={field}
              name={field}
              value={form[field]}
              onChange={updateField}
              required={field !== "image"}
              placeholder={field === "sizes" ? "sizes: S, M, L, XL" : field}
              className="focus-ring border border-white/15 bg-ink px-4 py-4 text-bone placeholder:text-zinc-600"
            />
          ))}
          <input
            type="file"
            accept="image/*"
            onChange={uploadProductImage}
            className="focus-ring border border-white/15 bg-ink px-4 py-4 text-sm text-bone file:mr-4 file:border-0 file:bg-bone file:px-4 file:py-2 file:text-ink md:col-span-2"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={updateField}
            required
            placeholder="description"
            className="focus-ring min-h-32 border border-white/15 bg-ink px-4 py-4 text-bone placeholder:text-zinc-600 md:col-span-2"
          />
          <button className="focus-ring bg-bone px-5 py-4 text-sm font-bold uppercase tracking-[0.22em] text-ink md:col-span-2">
            {editing ? "Update Product" : "Save Product"}
          </button>
        </form>
        {message ? <p className="mt-4 text-zinc-400">{message}</p> : null}

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Panel title="Products">
            {products.map((product) => (
              <div key={product._id} className="flex items-center justify-between border-b border-white/10 py-4">
                <div>
                  <p className="font-semibold text-bone">{product.name}</p>
                  <p className="text-sm text-zinc-500">{formatRupees(product.price)} / {product.category}</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <button onClick={() => editProduct(product)} className="underline">Edit</button>
                  <button onClick={() => deleteProduct(product._id)} className="text-red-300 underline">Delete</button>
                </div>
              </div>
            ))}
          </Panel>
          <Panel title="Orders">
            {orders.length ? orders.map((order) => (
              <div key={order._id} className="border-b border-white/10 py-4">
                <p className="font-semibold text-bone">{formatRupees(order.total)} / {order.status}</p>
                <p className="text-sm text-zinc-500">{order.address?.fullName || "Guest order"}</p>
              </div>
            )) : <p className="py-4 text-zinc-500">Admin orders appear here after login.</p>}
          </Panel>
        </div>
      </div>
    </section>
  );
}

function Panel({ title, children }) {
  return (
    <div className="border border-white/10 bg-smoke p-6">
      <h2 className="font-display text-2xl text-bone">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
