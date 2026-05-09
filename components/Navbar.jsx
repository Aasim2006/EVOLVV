"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/components/CartProvider";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/image-generator", label: "Create" },
  { href: "/about", label: "About" },
  { href: "/cart", label: "Cart" }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [accountLabel, setAccountLabel] = useState("Login");
  const [accountHref, setAccountHref] = useState("/login");
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const itemsWithAccount = [...navItems, { href: accountHref, label: accountLabel }];

  useEffect(() => {
    async function loadAccountState() {
      const response = await fetch("/api/account", { cache: "no-store" }).catch(() => null);
      if (!response?.ok) return;

      setAccountLabel("Account");
      setAccountHref("/account");
    }

    loadAccountState();
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="font-display text-sm uppercase tracking-[0.45em] text-bone">
          Evolvv
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {itemsWithAccount.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative text-sm text-zinc-300 transition hover:text-white"
            >
              {item.label}
              {item.label === "Cart" && count > 0 ? (
                <span className="ml-2 rounded-full bg-bone px-2 py-0.5 text-[10px] font-bold text-ink">
                  {count}
                </span>
              ) : null}
              <span className="absolute -bottom-2 left-0 h-px w-0 bg-white transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((value) => !value)}
            className="focus-ring luxury-border h-10 w-10 text-bone md:hidden"
          >
            {open ? "X" : "="}
          </button>
        </div>
      </nav>

      {open ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="border-t border-white/10 bg-ink px-5 py-4 md:hidden"
        >
          <div className="flex flex-col gap-4">
            {itemsWithAccount.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
          </div>
        </motion.div>
      ) : null}
    </header>
  );
}
