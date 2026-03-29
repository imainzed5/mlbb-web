"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import { StateMessage } from "@/components/ui/StateMessage";

type VerifyPayload = {
  redirectTo: string;
};

function isPositiveInteger(value: string) {
  return /^[0-9]+$/.test(value.trim()) && Number(value) > 0;
}

function isVerificationCode(value: string) {
  return /^[0-9]{4}$/.test(value.trim());
}

export function PlayerConnectPanel() {
  const router = useRouter();
  const [roleId, setRoleId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);

  async function sendCode() {
    if (!isPositiveInteger(roleId) || !isPositiveInteger(zoneId)) {
      setErrorMessage("Enter a valid role ID and zone ID before requesting a verification code.");
      return;
    }

    setIsSendingCode(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/player/auth/send-vc", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          roleId: Number(roleId),
          zoneId: Number(zoneId),
        }),
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to send verification code.");
      }

      setIsCodeSent(true);
      setStatusMessage(payload.message ?? "Verification code sent to your in-game mail.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to send verification code."
      );
    } finally {
      setIsSendingCode(false);
    }
  }

  async function verifyCode() {
    if (!isPositiveInteger(roleId) || !isPositiveInteger(zoneId) || !isVerificationCode(verificationCode)) {
      setErrorMessage("Enter the same role ID, zone ID, and a valid 4-digit verification code.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/player/auth/verify", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          roleId: Number(roleId),
          verificationCode: Number(verificationCode),
          zoneId: Number(zoneId),
        }),
      });
      const payload = (await response.json()) as VerifyPayload & { message?: string };

      if (!response.ok || !payload.redirectTo) {
        throw new Error(payload.message ?? "Unable to verify that account.");
      }

      startTransition(() => {
        router.push(payload.redirectTo);
        router.refresh();
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to verify that account."
      );
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <section
      className="space-y-5 rounded-[28px] bg-card-surface p-5 sm:p-6"
      style={{ border: "0.5px solid var(--border-subtle)" }}
    >
      <div className="space-y-2">
        <div className="inline-flex items-center rounded-full bg-accent-surface px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-accent-text uppercase">
          Account connect
        </div>
        <h1 className="text-[28px] font-medium tracking-[-0.04em] text-text-primary sm:text-[34px]">
          Connect your MLBB account
        </h1>
        <p className="max-w-2xl text-[14px] leading-7 text-text-secondary">
          Enter your in-game role ID and zone ID, request a 4-digit code, then confirm it from MLBB in-game mail to unlock your private player dashboard.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">
                Role ID
              </span>
              <input
                value={roleId}
                onChange={(event) => setRoleId(event.target.value.replace(/\D+/g, ""))}
                inputMode="numeric"
                placeholder="123456789"
                className="w-full rounded-xl bg-page-background px-3 py-3 text-[14px] text-text-primary outline-none transition-colors focus:border-accent-primary"
                style={{ border: "0.5px solid var(--border-subtle)" }}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">
                Zone ID
              </span>
              <input
                value={zoneId}
                onChange={(event) => setZoneId(event.target.value.replace(/\D+/g, ""))}
                inputMode="numeric"
                placeholder="1234"
                className="w-full rounded-xl bg-page-background px-3 py-3 text-[14px] text-text-primary outline-none transition-colors focus:border-accent-primary"
                style={{ border: "0.5px solid var(--border-subtle)" }}
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => void sendCode()}
              disabled={isSendingCode}
              className="inline-flex items-center justify-center rounded-lg border border-accent-primary bg-accent-surface px-4 py-3 text-[13px] font-medium text-accent-text transition-colors hover:bg-[#20436d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSendingCode ? "Sending code..." : isCodeSent ? "Resend code" : "Send verification code"}
            </button>
          </div>

          <label className="block w-full sm:max-w-xs">
            <span className="mb-2 block text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">
              Verification code
            </span>
            <input
              value={verificationCode}
              onChange={(event) => setVerificationCode(event.target.value.replace(/\D+/g, "").slice(0, 4))}
              inputMode="numeric"
              placeholder="4-digit code"
              className="w-full rounded-xl bg-page-background px-3 py-3 text-[14px] text-text-primary outline-none transition-colors focus:border-accent-primary"
              style={{ border: "0.5px solid var(--border-subtle)" }}
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => void verifyCode()}
              disabled={isVerifying}
              className="inline-flex items-center justify-center rounded-lg border border-border-subtle bg-card-surface px-4 py-3 text-[13px] font-medium text-text-primary transition-colors hover:border-accent-primary hover:text-accent-text disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isVerifying ? "Verifying..." : "Verify and open dashboard"}
            </button>
          </div>

          {statusMessage ? (
            <StateMessage title="Verification step ready" description={statusMessage} tone="default" />
          ) : null}

          {errorMessage ? (
            <StateMessage title="Unable to continue" description={errorMessage} tone="error" />
          ) : null}
        </div>

        <aside
          className="rounded-2xl bg-page-background/70 p-4 sm:p-5"
          style={{ border: "0.5px solid var(--border-subtle)" }}
        >
          <div className="text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">
            How it works
          </div>
          <ol className="mt-4 space-y-3 text-[13px] leading-6 text-text-secondary">
            <li>1. Use your MLBB account's role ID and zone ID.</li>
            <li>2. Request a verification code from this page.</li>
            <li>3. Open MLBB in-game mail and copy the 4-digit code.</li>
            <li>4. Verify it here to create a private session on this device.</li>
          </ol>
          <p className="mt-4 text-[12px] leading-6 text-text-muted">
            The dashboard is intentionally non-indexed and backed by an HTTP-only session cookie. Your MLBB JWT is never exposed to the browser runtime.
          </p>
        </aside>
      </div>
    </section>
  );
}