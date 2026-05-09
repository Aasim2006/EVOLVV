"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { formatRupees } from "@/lib/currency";

export default function AdminCustomersClient() {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const response = await fetch("/api/admin/customers", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setCustomers(data.customers || []);
    }
  }

  const filtered = useMemo(() => {
    return customers.filter((customer) =>
      `${customer.name} ${customer.email}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [customers, query]);

  return (
    <AdminShell title="Customers">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search customers"
        className="focus-ring mb-5 w-full border border-white/15 bg-smoke px-4 py-3 text-bone placeholder:text-zinc-600 md:max-w-md"
      />
      <div className="grid gap-4">
        {filtered.map((customer) => (
          <section key={customer._id} className="border border-white/10 bg-smoke p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <h2 className="font-display text-2xl">{customer.name}</h2>
                <p className="mt-1 text-sm text-zinc-500">{customer.email}</p>
              </div>
              <div className="text-left md:text-right">
                <p>{customer.orderCount} orders</p>
                <p className="text-zinc-500">{formatRupees(customer.totalSpent)}</p>
              </div>
            </div>
            {customer.orders?.length ? (
              <div className="mt-4 grid gap-2 md:grid-cols-3">
                {customer.orders.map((order) => (
                  <div key={order._id} className="border border-white/10 p-3 text-sm">
                    <p>#{String(order._id).slice(-6).toUpperCase()}</p>
                    <p className="mt-1 text-zinc-500">{formatRupees(order.total)} / {order.status}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </AdminShell>
  );
}
