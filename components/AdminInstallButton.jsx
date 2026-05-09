"use client";

import { useEffect, useState } from "react";

export default function AdminInstallButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function capturePrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }

    function markInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", markInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  }

  if (installed) {
    return <p className="mt-4 text-center text-sm text-emerald-300">Admin app installed.</p>;
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={installApp}
        disabled={!installPrompt}
        className="focus-ring w-full border border-white/15 px-5 py-4 text-sm font-bold uppercase tracking-[0.18em] text-bone transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Install Admin App
      </button>
      {!installPrompt ? (
        <p className="mt-3 text-center text-xs leading-5 text-zinc-500">
          In Safari, use Share, then Add to Dock. In Chrome, use the install icon or the three-dot menu.
        </p>
      ) : null}
    </div>
  );
}
