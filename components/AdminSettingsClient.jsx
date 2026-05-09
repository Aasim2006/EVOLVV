"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";

export default function AdminSettingsClient() {
  const [settings, setSettings] = useState({ storeName: "", supportEmail: "", bannerText: "", shippingFee: 12 });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const response = await fetch("/api/admin/settings", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setSettings(data.settings || settings);
    }
  }

  function updateSetting(event) {
    setSettings((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function saveSettings(event) {
    event.preventDefault();
    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    });
    setMessage(response.ok ? "Settings saved" : "Could not save settings");
  }

  async function changePassword(event) {
    event.preventDefault();
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(password)
    });
    const data = await response.json();
    setMessage(response.ok ? "Password updated" : data.error || "Could not update password");
    if (response.ok) setPassword({ currentPassword: "", newPassword: "" });
  }

  return (
    <AdminShell title="Settings">
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={saveSettings} className="border border-white/10 bg-smoke p-5">
          <h2 className="font-display text-2xl">Store Information</h2>
          {["storeName", "supportEmail", "bannerText", "shippingFee"].map((field) => (
            <input
              key={field}
              name={field}
              value={settings[field] || ""}
              onChange={updateSetting}
              placeholder={field}
              className="focus-ring mt-4 w-full border border-white/15 bg-ink px-4 py-3 text-bone placeholder:text-zinc-600"
            />
          ))}
          <button className="focus-ring mt-5 w-full bg-bone px-5 py-4 text-sm font-bold uppercase tracking-[0.22em] text-ink">
            Save Settings
          </button>
        </form>
        <form onSubmit={changePassword} className="border border-white/10 bg-smoke p-5">
          <h2 className="font-display text-2xl">Change Admin Password</h2>
          <input
            type="password"
            value={password.currentPassword}
            onChange={(event) => setPassword((current) => ({ ...current, currentPassword: event.target.value }))}
            placeholder="Current password"
            className="focus-ring mt-4 w-full border border-white/15 bg-ink px-4 py-3 text-bone placeholder:text-zinc-600"
          />
          <input
            type="password"
            value={password.newPassword}
            onChange={(event) => setPassword((current) => ({ ...current, newPassword: event.target.value }))}
            placeholder="New password"
            className="focus-ring mt-4 w-full border border-white/15 bg-ink px-4 py-3 text-bone placeholder:text-zinc-600"
          />
          <button className="focus-ring mt-5 w-full bg-bone px-5 py-4 text-sm font-bold uppercase tracking-[0.22em] text-ink">
            Update Password
          </button>
        </form>
      </div>
      {message ? <p className="mt-5 text-sm text-zinc-400">{message}</p> : null}
    </AdminShell>
  );
}
