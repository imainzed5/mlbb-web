"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

export function PlayerLogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await fetch("/api/player/auth/logout", {
        method: "POST",
      });
    } finally {
      startTransition(() => {
        router.push("/player");
        router.refresh();
      });
      setIsLoggingOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      disabled={isLoggingOut}
      className="inline-flex items-center rounded-lg border border-border-subtle bg-card-surface px-3 py-2 text-[12px] font-medium text-text-secondary transition-colors hover:border-accent-primary hover:text-accent-text disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoggingOut ? "Disconnecting..." : "Disconnect"}
    </button>
  );
}