"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AuthForm({ mode }) {
  const [error, setError] = useState("");
  const [nextPath, setNextPath] = useState("/account");
  const isSignup = mode === "signup";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(params.get("next") || "/account");
  }, []);

  useEffect(() => {
    async function redirectIfLoggedIn() {
      const response = await fetch("/api/account", { cache: "no-store" }).catch(() => null);
      if (response?.ok) {
        window.location.replace(nextPath);
      }
    }

    redirectIfLoggedIn();
  }, [nextPath]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Something went wrong");
    window.location.replace(nextPath);
  }

  return (
    <section className="min-h-screen bg-ink px-5 pb-24 pt-32 md:px-8">
      <form onSubmit={handleSubmit} className="mx-auto max-w-md border border-white/10 bg-smoke p-6">
        <h1 className="font-display text-4xl text-bone">{isSignup ? "Signup" : "Login"}</h1>
        {isSignup ? <Input name="name" placeholder="Name" /> : null}
        <Input name="email" placeholder="Email" type="email" autoComplete="email" />
        <Input name="password" placeholder="Password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} />
        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
        <button className="focus-ring mt-6 w-full bg-bone px-5 py-4 text-sm font-bold uppercase tracking-[0.22em] text-ink">
          {isSignup ? "Create Account" : "Login"}
        </button>
        <p className="mt-5 text-sm text-zinc-500">
          {isSignup ? "Already evolved?" : "New here?"}{" "}
          <Link className="text-bone underline" href={`${isSignup ? "/login" : "/signup"}${nextPath !== "/account" ? `?next=${encodeURIComponent(nextPath)}` : ""}`}>
            {isSignup ? "Login" : "Signup"}
          </Link>
        </p>
      </form>
    </section>
  );
}

function Input({ name, placeholder, type = "text", ...props }) {
  return (
    <input
      name={name}
      type={type}
      required
      placeholder={placeholder}
      {...props}
      className="focus-ring mt-5 w-full border border-white/15 bg-ink px-4 py-4 text-bone placeholder:text-zinc-600"
    />
  );
}
