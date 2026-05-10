"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { formatRupees } from "@/lib/currency";

export default function AdminOrderDetailsClient({ id }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    const response = await fetch(`/api/admin/orders/${id}`, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setOrder(data.order);
    }
  }

  async function updateStatus(status) {
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (response.ok) load();
  }

  return (
    <AdminShell title="Order Details">
      {!order ? <p className="text-zinc-400">Loading order...</p> : (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <section className="border border-white/10 bg-smoke p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">#{String(order._id).slice(-6).toUpperCase()}</p>
            <h2 className="mt-2 font-display text-3xl">{order.user?.name || order.address?.fullName || "Guest"}</h2>
            <div className="mt-5 divide-y divide-white/10">
              {(order.items || []).map((item, index) => (
                <div key={`${item.name}-${index}`} className="grid gap-4 py-4 md:grid-cols-[1fr_auto]">
                  <div className="min-w-0">
                    <p>{item.name}</p>
                    <p className="text-sm text-zinc-500">Size {item.size} x {item.quantity}</p>
                    {item.custom ? (
                      <div className="mt-3">
                        <p className="text-sm text-zinc-500">
                          Customization fee: {formatRupees(item.customizationFee || 120)}
                        </p>
                        {item.designName ? <p className="mt-1 text-xs text-zinc-600">File: {item.designName}</p> : null}
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <OrderImage title="Uploaded Design" src={item.designImage} />
                          <OrderImage title="Mockup" src={item.mockupImage || item.image} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <p className="font-semibold">{formatRupees(Number(item.price || 0) * Number(item.quantity || 0))}</p>
                </div>
              ))}
            </div>
          </section>
          <aside className="space-y-5">
            <section className="border border-white/10 bg-smoke p-5">
              <h3 className="font-display text-2xl">Status</h3>
              <select value={order.status || "pending"} onChange={(event) => updateStatus(event.target.value)} className="focus-ring mt-4 w-full border border-white/15 bg-ink px-4 py-3 capitalize">
                {["pending", "processing", "shipped", "delivered", "cancelled"].map((status) => <option key={status}>{status}</option>)}
              </select>
              <p className="mt-4 text-3xl font-semibold">{formatRupees(order.total)}</p>
              <p className="mt-2 text-sm capitalize text-zinc-500">Payment: {order.paymentStatus || "pending"}</p>
            </section>
            <section className="border border-white/10 bg-smoke p-5">
              <h3 className="font-display text-2xl">Shipping</h3>
              <p className="mt-3 text-zinc-400">{order.address?.fullName}</p>
              <p className="text-zinc-400">{order.address?.line1}</p>
              <p className="text-zinc-400">{[order.address?.city, order.address?.state, order.address?.postalCode, order.address?.country].filter(Boolean).join(", ")}</p>
            </section>
          </aside>
        </div>
      )}
    </AdminShell>
  );
}

function OrderImage({ title, src }) {
  if (!src) {
    return (
      <div className="border border-white/10 bg-ink p-3">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{title}</p>
        <p className="mt-3 text-sm text-zinc-600">Not available</p>
      </div>
    );
  }

  return (
    <a href={src} target="_blank" rel="noreferrer" className="block border border-white/10 bg-ink p-3 transition hover:border-white/25">
      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{title}</p>
      <div className="mt-3 flex aspect-square items-center justify-center overflow-hidden bg-black">
        <img src={src} alt={title} className="h-full w-full object-contain" />
      </div>
      <p className="mt-2 text-xs text-zinc-600">Open full image</p>
    </a>
  );
}
