"use client";

import { useState } from "react";

export default function AdminLoginClient() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) return setError(data.error || "Admin login failed");
    window.location.href = "/admin/dashboard";
  }

  return (
    <section className="noise flex min-h-screen items-center justify-center bg-ink px-5">
      <form onSubmit={submit} className="w-full max-w-md border border-white/10 bg-smoke p-6 shadow-glow">
        <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">EVOLVV Admin</p>
        <h1 className="mt-4 font-display text-5xl text-bone">Login</h1>
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="focus-ring mt-8 w-full border border-white/15 bg-ink px-4 py-4 text-bone placeholder:text-zinc-600"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="focus-ring mt-4 w-full border border-white/15 bg-ink px-4 py-4 text-bone placeholder:text-zinc-600"
        />
        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
        <button
          disabled={loading}
          className="focus-ring mt-6 w-full bg-bone px-5 py-4 text-sm font-bold uppercase tracking-[0.22em] text-ink disabled:opacity-60"
        >
          {loading ? "Checking" : "Enter Dashboard"}
        </button>
      </form>
    </section>
  );
}
