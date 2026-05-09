"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import { formatRupees } from "@/lib/currency";

export default function AdminDashboardClient({ view }) {
  const [summary, setSummary] = useState(null);
  const pendingBadge = summary?.totals?.pendingOrders || 0;

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    const response = await fetch("/api/admin/summary", { cache: "no-store" });
    if (response.ok) setSummary(await response.json());
  }

  if (view === "analytics") {
    return (
      <AdminShell title="Analytics" badge={pendingBadge}>
        <Analytics summary={summary} />
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Dashboard" badge={pendingBadge}>
      <Dashboard summary={summary} />
    </AdminShell>
  );
}

function Dashboard({ summary }) {
  const totals = summary?.totals || {};
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Total Orders" value={totals.orders || 0} />
        <Metric label="Revenue" value={formatRupees(totals.revenue || 0)} />
        <Metric label="Customers" value={totals.customers || 0} />
        <Metric label="Products" value={totals.products || 0} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Panel title="Recent Orders">
          <OrderTable orders={summary?.recentOrders || []} />
        </Panel>
        <Panel title="Best Sellers">
          {(summary?.bestSellers || []).map((item) => (
            <div key={item.name} className="flex justify-between border-b border-white/10 py-3 text-sm">
              <span className="text-bone">{item.name}</span>
              <span className="text-zinc-500">{item.quantity} sold</span>
            </div>
          ))}
        </Panel>
      </div>
      {summary?.lowStockProducts?.length ? (
        <Panel title="Low Stock Warning">
          <div className="grid gap-3 md:grid-cols-3">
            {summary.lowStockProducts.map((product) => (
              <div key={product._id} className="border border-red-300/20 bg-red-950/20 p-4">
                <p className="font-semibold">{product.name}</p>
                <p className="mt-1 text-sm text-red-200">{product.stock} left</p>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}
    </div>
  );
}

function Analytics({ summary }) {
  const maxRevenue = Math.max(...(summary?.monthly || []).map((item) => item.revenue), 1);
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Panel title="Monthly Revenue">
        <div className="flex h-72 items-end gap-3 border-b border-white/10 pt-8">
          {(summary?.monthly || []).map((item) => (
            <div key={item.key} className="flex flex-1 flex-col items-center gap-3">
              <div
                className="w-full bg-bone transition hover:bg-white"
                style={{ height: `${Math.max((item.revenue / maxRevenue) * 220, 8)}px` }}
                title={formatRupees(item.revenue)}
              />
              <span className="text-xs text-zinc-500">{item.label}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Orders Overview">
        {(summary?.monthly || []).map((item) => (
          <div key={item.key} className="flex justify-between border-b border-white/10 py-3">
            <span>{item.label}</span>
            <span className="text-zinc-500">{item.orders} orders</span>
          </div>
        ))}
      </Panel>
      <Panel title="Best-Selling Items">
        {(summary?.bestSellers || []).map((item) => (
          <div key={item.name} className="flex justify-between border-b border-white/10 py-3">
            <span>{item.name}</span>
            <span className="text-zinc-500">{formatRupees(item.revenue)}</span>
          </div>
        ))}
      </Panel>
    </div>
  );
}

function OrderTable({ orders }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          <tr>
            <th className="py-3">Order</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Total</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="border-t border-white/10">
              <td className="py-4">
                <Link className="underline" href={`/admin/orders/${order._id}`}>
                  #{String(order._id).slice(-6).toUpperCase()}
                </Link>
              </td>
              <td>{order.user?.name || order.customer?.name || order.address?.fullName || "Guest"}</td>
              <td className="capitalize text-zinc-400">{order.status}</td>
              <td>{formatRupees(order.total)}</td>
              <td className="text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="border border-white/10 bg-smoke p-5 transition hover:border-white/25">
      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      <p className="mt-3 font-display text-3xl">{value}</p>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="border border-white/10 bg-smoke p-5">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
