"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/image-generator", label: "Create" },
  { href: "/about", label: "About" },
  { href: "/cart", label: "Cart" }
];

export default function Navbar() {
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
      <nav className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 md:h-20 md:flex-row md:items-center md:justify-between md:px-8 md:py-0">
        <Link href="/" className="font-display text-sm uppercase tracking-[0.45em] text-bone md:shrink-0">
          Evolvv
        </Link>

        <div className="flex items-center gap-5 overflow-x-auto whitespace-nowrap pb-1 text-sm md:gap-8 md:overflow-visible md:pb-0">
          {itemsWithAccount.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative shrink-0 text-zinc-300 transition hover:text-white"
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
      </nav>
    </header>
  );
}
