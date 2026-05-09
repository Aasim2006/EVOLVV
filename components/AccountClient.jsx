"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatRupees } from "@/lib/currency";

export default function AccountClient() {
  const { clearCart } = useCart();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAccount() {
      const response = await fetch("/api/account", { cache: "no-store" }).catch(() => null);
      if (!response?.ok) {
        setError("Please login to view your account.");
        setLoading(false);
        return;
      }

      setAccount(await response.json());
      setLoading(false);
    }

    loadAccount();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearCart();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <section className="min-h-screen bg-ink px-5 pb-24 pt-32 md:px-8">
        <div className="mx-auto max-w-5xl text-zinc-400">Loading account...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen bg-ink px-5 pb-24 pt-32 md:px-8">
        <div className="mx-auto max-w-5xl border border-white/10 bg-smoke p-6">
          <h1 className="font-display text-4xl text-bone">Account</h1>
          <p className="mt-4 text-zinc-400">{error}</p>
          <Link
            href="/login"
            className="focus-ring mt-6 inline-flex bg-bone px-5 py-3 text-sm font-bold uppercase tracking-[0.22em] text-ink"
          >
            Login
          </Link>
        </div>
      </section>
    );
  }

  const { user, orders = [] } = account;

  return (
    <section className="min-h-screen bg-ink px-5 pb-24 pt-32 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">Customer Account</p>
            <h1 className="mt-3 font-display text-5xl text-bone md:text-7xl">Welcome, {user.name}</h1>
          </div>
          <button
            onClick={logout}
            className="focus-ring w-fit border border-white/15 px-5 py-3 text-sm font-bold uppercase tracking-[0.22em] text-bone"
          >
            Logout
          </button>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[320px_1fr]">
          <section className="h-fit border border-white/10 bg-smoke p-6">
            <h2 className="font-display text-2xl text-bone">Your Details</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <Detail label="Name" value={user.name} />
              <Detail label="Email" value={user.email} />
              <Detail label="Role" value={user.role} />
              <Detail label="Customer since" value={formatDate(user.createdAt)} />
            </dl>
          </section>

          <section className="border border-white/10 bg-smoke p-6">
            <h2 className="font-display text-2xl text-bone">Order Details</h2>
            {orders.length ? (
              <div className="mt-3 divide-y divide-white/10">
                {orders.map((order) => (
                  <article key={order._id} className="py-5">
                    <div className="flex flex-col justify-between gap-2 md:flex-row">
                      <div>
                        <p className="font-semibold text-bone">Order #{String(order._id).slice(-6).toUpperCase()}</p>
                        <p className="mt-1 text-sm text-zinc-500">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="font-semibold text-bone">{formatRupees(order.total)}</p>
                        <p className="mt-1 text-sm capitalize text-zinc-500">{order.status || "pending"}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {(order.items || []).map((item, index) => (
                        <div key={`${order._id}-${index}`} className="flex justify-between gap-4 text-sm text-zinc-400">
                          <span>
                            {item.name} {item.size ? `/ ${item.size}` : ""} x {item.quantity}
                          </span>
                          <span>{formatRupees((item.price || 0) * (item.quantity || 0))}</span>
                        </div>
                      ))}
                    </div>
                    {order.address?.fullName ? (
                      <p className="mt-4 text-sm text-zinc-500">
                        Ships to {order.address.fullName}, {order.address.city}, {order.address.country}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 border border-dashed border-white/15 p-6 text-zinc-400">
                <p>No orders yet.</p>
                <Link href="/shop" className="mt-4 inline-flex text-sm font-semibold uppercase tracking-[0.22em] text-bone underline">
                  Start shopping
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-zinc-500">{label}</dt>
      <dd className="mt-1 text-bone">{value || "-"}</dd>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}
