"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import "./checkout-button.css";

interface CheckoutButtonProps {
  productSlug: string;
  productName: string;
  priceMinor: number;
  customerName?: string;
  phone?: string;
}

type RazorpayInstance = {
  on: (event: "payment.failed", cb: (response: { error: { description?: string } }) => void) => void;
  open: () => void;
};
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

// Razorpay's theme option needs a literal colour: this is the brand --navy token.
const BRAND_NAVY = "#071A4D";

/** Only rendered when NEXT_PUBLIC_PAYMENTS_ENABLED === "true" (see paymentsEnabled in src/data/catalog.ts). */
export function CheckoutButton({ productSlug, productName, priceMinor, customerName, phone }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCheckout = async () => {
    setError("");
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const Razorpay = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
    if (!key || !Razorpay) {
      setError("Payments are not available right now. Please try again later.");
      return;
    }
    setLoading(true);
    try {
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      if (!sessionData.authenticated) {
        router.push(`/student/login?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          customerName: customerName || sessionData.user.name,
          phone: phone || "",
        }),
      });
      const orderData = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok) {
        setError(orderData.error || "We couldn't start your order. Please try again.");
        return;
      }

      const rzp = new Razorpay({
        key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "OurMocks",
        description: productName,
        order_id: orderData.razorpayOrderId,
        // Fulfilment happens in the verified webhook; this only moves the student on.
        handler: () => router.push("/student"),
        prefill: {
          name: sessionData.user.name,
          email: sessionData.user.email,
          contact: phone,
        },
        theme: { color: BRAND_NAVY },
      });
      rzp.on("payment.failed", (response) => {
        setError(
          `Payment failed${response.error.description ? `: ${response.error.description}` : ""}. Please try again. If money left your account, our refund policy (/refund-policy) explains what happens next.`,
        );
      });
      rzp.open();
    } catch {
      setError("Something went wrong during checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cb-wrap">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        aria-busy={loading}
        className="button-primary cb-button"
      >
        {loading ? "Starting checkout…" : `Enrol now for ₹${(priceMinor / 100).toLocaleString("en-IN")}`}
      </button>
      {error && (
        <p className="cb-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
