"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

export default function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("evolvv_cart");
      setItems(saved ? JSON.parse(saved) : []);
    } catch {
      setItems([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem("evolvv_cart", JSON.stringify(items));
    } catch {
      const slimItems = items.map((item) =>
        item.custom && item.image?.startsWith("data:image/")
          ? { ...item, image: "/product-tee.svg" }
          : item
      );
      window.localStorage.setItem("evolvv_cart", JSON.stringify(slimItems));
    }
  }, [items, ready]);

  function addItem(product, size = "M") {
    setItems((current) => {
      const key = `${product._id}-${size}`;
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...current,
        {
          key,
          productId: product._id,
          slug: product.slug,
          href: product.custom ? "/image-generator" : `/product/${product.slug || product._id}`,
          name: product.name,
          price: product.price,
          image: product.image || product.images?.[0]?.url,
          size,
          custom: product.custom,
          quantity: 1
        }
      ];
    });
  }

  function updateQuantity(key, quantity) {
    setItems((current) =>
      quantity <= 0
        ? current.filter((item) => item.key !== key)
        : current.map((item) => (item.key === key ? { ...item, quantity } : item))
    );
  }

  function removeItem(key) {
    setItems((current) => current.filter((item) => item.key !== key));
  }

  function clearCart() {
    window.localStorage.removeItem("evolvv_cart");
    setItems([]);
  }

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const value = { items, addItem, updateQuantity, removeItem, clearCart, subtotal };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
