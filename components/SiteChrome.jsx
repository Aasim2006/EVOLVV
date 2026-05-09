"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import CartProvider from "@/components/CartProvider";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  if (isAdmin) {
    return <main>{children}</main>;
  }

  return (
    <CartProvider>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </CartProvider>
  );
}
