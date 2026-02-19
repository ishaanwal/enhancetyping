"use client";

import { useState } from "react";

type Props = {
  stripeConfigured: boolean;
  isPremium: boolean;
};

export function BillingActions({ stripeConfigured, isPremium }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const goToCheckout = async (interval: "monthly" | "yearly") => {
    if (!stripeConfigured) {
      setMessage("Billing not configured in this environment.");
      return;
    }
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interval })
    });
    const json = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(json.error || "Checkout failed");
      return;
    }
    window.location.href = json.url;
  };

  const openPortal = async () => {
    if (!stripeConfigured) {
      setMessage("Billing not configured in this environment.");
      return;
    }
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/billing/portal", { method: "POST" });
    const json = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(json.error || "Could not open portal");
      return;
    }
    window.location.href = json.url;
  };

  return (
    <div className="space-y-3">
      {isPremium ? (
        <div className="flex flex-wrap gap-2">
          <button
            disabled={loading || !stripeConfigured}
            onClick={() => void openPortal()}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Manage Billing
          </button>
          <button
            disabled={loading || !stripeConfigured}
            onClick={() => void goToCheckout("yearly")}
            className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Switch Plan
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            disabled={loading || !stripeConfigured}
            onClick={() => void goToCheckout("monthly")}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start Monthly
          </button>
          <button
            disabled={loading || !stripeConfigured}
            onClick={() => void goToCheckout("yearly")}
            className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start Yearly
          </button>
        </div>
      )}
      {message ? <p className="text-sm text-amber-300">{message}</p> : null}
    </div>
  );
}
