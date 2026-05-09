"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Settings" }
];

export default function AdminShell({ children, title = "Dashboard", badge = 0 }) {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <section className="min-h-screen bg-ink text-bone">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-white/10 bg-black/40 p-5 lg:border-b-0 lg:border-r lg:p-6">
          <div className="flex items-center justify-between gap-4 lg:block">
            <Link href="/admin/dashboard" className="font-display text-sm uppercase tracking-[0.45em]">
              EVOLVV Admin
            </Link>
            {badge > 0 ? (
              <span className="rounded-full bg-bone px-3 py-1 text-xs font-bold text-ink lg:mt-5 lg:inline-flex">
                {badge} pending
              </span>
            ) : null}
          </div>
          <nav className="mt-6 grid grid-cols-2 gap-2 lg:grid-cols-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`focus-ring border px-4 py-3 text-sm uppercase tracking-[0.18em] transition ${
                    active
                      ? "border-bone bg-bone text-ink"
                      : "border-white/10 text-zinc-400 hover:border-white/30 hover:text-bone"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={logout}
              className="focus-ring border border-white/10 px-4 py-3 text-left text-sm uppercase tracking-[0.18em] text-zinc-400 transition hover:border-white/30 hover:text-bone"
            >
              Logout
            </button>
          </nav>
          <div className="mt-8 hidden border border-white/10 bg-smoke p-4 lg:block">
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Profile</p>
            <p className="mt-2 font-display text-xl">Store Owner</p>
            <p className="mt-1 text-sm text-zinc-500">Premium control room</p>
          </div>
        </aside>
        <main className="p-5 md:p-8">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">Admin</p>
                <h1 className="mt-2 font-display text-4xl md:text-6xl">{title}</h1>
              </div>
              <Link href="/" className="text-sm uppercase tracking-[0.22em] text-zinc-500 underline">
                Storefront
              </Link>
            </div>
            {children}
          </motion.div>
        </main>
      </div>
    </section>
  );
}
