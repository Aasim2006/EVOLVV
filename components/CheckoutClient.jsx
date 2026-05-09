"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatRupees } from "@/lib/currency";

export default function CheckoutClient() {
  const { items, subtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [checkingAccount, setCheckingAccount] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [message, setMessage] = useState("");
  const [pendingOrder, setPendingOrder] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [address, setAddress] = useState({
    fullName: "",
    line1: "",
    city: "",
    state: "",
    postalCode: "",
    country: ""
  });

  useEffect(() => {
    async function loadCustomer() {
      const response = await fetch("/api/account", { cache: "no-store" }).catch(() => null);
      if (!response?.ok) {
        setCheckingAccount(false);
        return;
      }

      const data = await response.json();
      const lastAddress = data.orders?.find((order) => order.address)?.address || {};
      setCustomer(data.user);
      setAddress({
        fullName: lastAddress.fullName || data.user?.name || "",
        line1: lastAddress.line1 || "",
        city: lastAddress.city || "",
        state: lastAddress.state || "",
        postalCode: lastAddress.postalCode || "",
        country: lastAddress.country || ""
      });
      setCheckingAccount(false);
    }

    loadCustomer();
  }, []);

  async function submitCheckout(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    const response = await placeOrder(pendingOrder.address);
    await handleCheckoutResponse(response);
  }

  function requestConfirmation(event) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    setPendingOrder({
      address: Object.fromEntries(form.entries()),
      paymentMethod,
      total: subtotal + (subtotal ? 12 : 0)
    });
  }

  async function placeOrder(address) {
    setLoading(true);
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, address, paymentMethod })
    });
    return response;
  }

  async function handleCheckoutResponse(response) {
    const data = await response.json();
    if (data.paymentMethod === "cod") {
      clearCart();
      setOrderPlaced("cod");
      setPendingOrder(null);
      setLoading(false);
      return;
    }
    if (data.provider === "razorpay") {
      await openRazorpayCheckout(data);
      return;
    }
    if (!response.ok) setMessage(data.error || "Checkout failed.");
    setLoading(false);
  }

  async function openRazorpayCheckout(order) {
    const ready = await loadRazorpayScript();
    if (!ready) {
      setMessage("Could not load Razorpay checkout.");
      setLoading(false);
      return;
    }

    const checkout = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: order.name,
      description: order.description,
      order_id: order.razorpayOrderId,
      prefill: {
        name: order.customer?.name || customer?.name || "",
        email: order.customer?.email || customer?.email || ""
      },
      theme: {
        color: "#050505"
      },
      handler: async (payment) => {
        const verifyResponse = await fetch("/api/checkout/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.orderId, ...payment })
        });
        const verifyData = await verifyResponse.json().catch(() => ({}));

        if (!verifyResponse.ok) {
          setMessage(verifyData.error || "Payment verification failed.");
          setLoading(false);
          return;
        }

        clearCart();
        setOrderPlaced("razorpay");
        setPendingOrder(null);
        setLoading(false);
      },
      modal: {
        ondismiss: () => {
          setMessage("Payment was cancelled.");
          setLoading(false);
        }
      }
    });

    checkout.open();
  }

  function updateAddress(event) {
    setAddress((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  return (
    <section className="min-h-screen bg-ink px-5 pb-24 pt-32 md:px-8">
      {checkingAccount ? (
        <div className="mx-auto max-w-5xl text-zinc-400">Checking account...</div>
      ) : !customer ? (
        <div className="mx-auto max-w-md border border-white/10 bg-smoke p-6">
          <h1 className="font-display text-4xl text-bone">Login to Checkout</h1>
          <p className="mt-4 text-sm text-zinc-400">Please login or create an account before placing your order.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <a
              href="/login?next=/checkout"
              className="focus-ring bg-bone px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.18em] text-ink"
            >
              Login
            </a>
            <a
              href="/signup?next=/checkout"
              className="focus-ring border border-white/15 px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.18em] text-bone"
            >
              Signup
            </a>
          </div>
        </div>
      ) : orderPlaced ? (
        <OrderPlaced paymentMethod={orderPlaced} />
      ) : (
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_320px]">
        <form onSubmit={requestConfirmation} className="space-y-5">
          <h1 className="font-display text-5xl text-bone md:text-7xl">Checkout</h1>
          {customer ? (
            <p className="border border-white/10 bg-smoke px-4 py-3 text-sm text-zinc-400">
              Checking out as <span className="text-bone">{customer.name}</span> ({customer.email})
            </p>
          ) : null}
          {["fullName", "line1", "city", "state", "postalCode", "country"].map((field) => (
            <input
              key={field}
              name={field}
              value={address[field]}
              onChange={updateAddress}
              required
              placeholder={field.replace(/([A-Z])/g, " $1")}
              className="focus-ring w-full border border-white/15 bg-smoke px-4 py-4 capitalize text-bone placeholder:text-zinc-600"
            />
          ))}
          <div className="grid gap-3 border border-white/10 bg-smoke p-4">
            <p className="text-sm uppercase tracking-[0.22em] text-zinc-500">Payment</p>
            <label className="flex cursor-pointer items-center justify-between gap-4 border border-white/10 px-4 py-3 text-sm text-bone">
              <span>Cash on Delivery</span>
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
                className="accent-bone"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-4 border border-white/10 px-4 py-3 text-sm text-bone">
              <span>Pay Online with Razorpay</span>
              <input
                type="radio"
                name="paymentMethod"
                value="razorpay"
                checked={paymentMethod === "razorpay"}
                onChange={() => setPaymentMethod("razorpay")}
                className="accent-bone"
              />
            </label>
          </div>
          {message ? <p className="border border-white/10 bg-smoke px-4 py-3 text-sm text-zinc-300">{message}</p> : null}
          <button
            disabled={loading || items.length === 0}
            className="focus-ring w-full bg-bone px-6 py-4 text-sm font-bold uppercase tracking-[0.22em] text-ink disabled:opacity-50"
          >
            {loading ? "Placing order" : paymentMethod === "cod" ? "Place COD Order" : "Pay with Razorpay"}
          </button>
        </form>
        <aside className="h-fit border border-white/10 bg-smoke p-6">
          <h2 className="font-display text-2xl">Total</h2>
          <p className="mt-4 text-4xl font-semibold">{formatRupees(subtotal + (subtotal ? 12 : 0))}</p>
          <p className="mt-3 text-sm text-zinc-500">Includes flat-rate shipping.</p>
        </aside>
        {pendingOrder ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm">
            <div className="w-full max-w-lg border border-white/10 bg-smoke p-6 shadow-glow">
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Confirm Order</p>
              <h2 className="mt-3 font-display text-3xl text-bone">Place this order?</h2>
              <div className="mt-5 space-y-3 text-sm text-zinc-400">
                <p>
                  Payment:{" "}
                  <span className="text-bone">
                    {pendingOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay"}
                  </span>
                </p>
                <p>
                  Total: <span className="text-bone">{formatRupees(pendingOrder.total)}</span>
                </p>
                <p>
                  Deliver to:{" "}
                  <span className="text-bone">
                    {pendingOrder.address.fullName}, {pendingOrder.address.line1}, {pendingOrder.address.city}
                  </span>
                </p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPendingOrder(null)}
                  className="focus-ring border border-white/15 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-bone"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={submitCheckout}
                  disabled={loading}
                  className="focus-ring bg-bone px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-ink disabled:opacity-50"
                >
                  {loading ? "Placing" : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      )}
    </section>
  );
}

function OrderPlaced({ paymentMethod }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
      <div className="w-full border border-white/10 bg-smoke p-8 text-center shadow-glow">
        <div className="mx-auto flex h-24 w-24 animate-[order-pop_0.7s_ease-out] items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-300/10">
          <svg viewBox="0 0 64 64" className="h-14 w-14">
            <path
              d="M18 33L28 43L48 21"
              fill="none"
              stroke="#86efac"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="6"
              className="animate-[order-check_0.8s_ease-out_0.2s_both]"
            />
          </svg>
        </div>
        <h1 className="mt-6 font-display text-4xl text-bone">Order Placed</h1>
        <p className="mt-3 text-zinc-400">
          {paymentMethod === "cod"
            ? "Your order is confirmed. Pay by cash when it arrives."
            : "Your order is confirmed and payment was received."}
        </p>
        <a
          href="/account"
          className="focus-ring mt-7 inline-flex bg-bone px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-ink"
        >
          View Orders
        </a>
      </div>
    </div>
  );
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
