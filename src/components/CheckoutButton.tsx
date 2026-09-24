"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

interface CheckoutButtonProps {
  productSlug: string;
  priceMinor: number;
  customerName?: string;
  phone?: string;
}

export function CheckoutButton({ productSlug, priceMinor, customerName, phone }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // 1. Check if user is logged in first (if not, redirect to auth)
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      
      if (!sessionData.authenticated) {
        // You could pass a callback URL if you want, but for now just redirect
        router.push("/student/auth");
        return;
      }

      // 2. Create Order on our backend
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          customerName: customerName || sessionData.user.name,
          phone: phone || "",
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        alert(err.error || "Failed to create order");
        setLoading(false);
        return;
      }

      const orderData = await orderRes.json();

      // 3. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mock", // Public key
        amount: orderData.amount,
        currency: orderData.currency,
        name: "TestDisha",
        description: `Enrolment for ${productSlug}`,
        order_id: orderData.razorpayOrderId,
        handler: function (response: any) {
          // Razorpay returns razorpay_payment_id, razorpay_order_id, razorpay_signature
          // We rely on the webhook for actual fulfillment, but we can optimistically redirect
          router.push("/student/dashboard?purchase=success");
        },
        prefill: {
          name: sessionData.user.name,
          email: sessionData.user.email,
          contact: phone,
        },
        theme: {
          color: "#3b82f6",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (err) {
      alert("Something went wrong during checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="button-primary"
        style={{ width: "100%", justifyContent: "center", padding: "1rem" }}
      >
        {loading ? "Processing..." : `Enrol Now for ₹${(priceMinor / 100).toLocaleString("en-IN")}`}
      </button>
    </>
  );
}
