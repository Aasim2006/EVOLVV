"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { formatRupees } from "@/lib/currency";

const statuses = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersClient() {
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const pending = orders.filter((order) => ["pending", "processing"].includes(order.status)).length;

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const response = await fetch("/api/orders", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setOrders(data.orders || []);
    }
  }

  async function updateStatus(id, value) {
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value })
    });
    if (response.ok) refresh();
  }

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const haystack = `${order._id} ${order.user?.name || ""} ${order.user?.email || ""} ${order.address?.fullName || ""}`.toLowerCase();
      return (status === "all" || order.status === status) && haystack.includes(query.toLowerCase());
    });
  }, [orders, query, status]);

  return (
    <AdminShell title="Orders" badge={pending}>
      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_240px]">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search orders" className="focus-ring border border-white/15 bg-smoke px-4 py-3 text-bone placeholder:text-zinc-600" />
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="focus-ring border border-white/15 bg-smoke px-4 py-3 text-bone">
          {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto border border-white/10 bg-smoke p-5">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            <tr><th className="py-3">Order</th><th>Customer</th><th>Address</th><th>Payment</th><th>Status</th><th>Total</th><th>Details</th></tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order._id} className="border-t border-white/10">
                <td className="py-4">#{String(order._id).slice(-6).toUpperCase()}</td>
                <td>{order.user?.name || order.address?.fullName || "Guest"}<p className="text-xs text-zinc-500">{order.user?.email}</p></td>
                <td className="text-zinc-400">{[order.address?.city, order.address?.state, order.address?.country].filter(Boolean).join(", ")}</td>
                <td className="capitalize text-zinc-400">{order.paymentStatus || "pending"}</td>
                <td>
                  <select value={order.status || "pending"} onChange={(event) => updateStatus(order._id, event.target.value)} className="border border-white/15 bg-ink px-3 py-2 capitalize">
                    {statuses.filter((item) => item !== "all").map((item) => <option key={item}>{item}</option>)}
                  </select>
                </td>
                <td>{formatRupees(order.total)}</td>
                <td><Link href={`/admin/orders/${order._id}`} className="underline">Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
