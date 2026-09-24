import test from "node:test";
import assert from "node:assert";
import crypto from "crypto";
import { verifyRazorpaySignature, verifyWebhookSignature } from "../src/server/razorpay.ts";

test("Phase 6: Razorpay Webhook Signature Verification", async (t) => {
  await t.test("Valid webhook signature passes", () => {
    // Setup env mock for test
    process.env.RAZORPAY_WEBHOOK_SECRET = "test_secret";
    
    const payload = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: "pay_123" } } } });
    
    // Generate valid signature
    const signature = crypto.createHmac("sha256", "test_secret").update(payload).digest("hex");
    
    const isValid = verifyWebhookSignature(payload, signature);
    assert.strictEqual(isValid, true, "Signature should be valid");
  });

  await t.test("Invalid webhook signature fails", () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = "test_secret";
    const payload = JSON.stringify({ event: "payment.captured" });
    const invalidSignature = "invalid_hex_string_12345";
    
    const isValid = verifyWebhookSignature(payload, invalidSignature);
    assert.strictEqual(isValid, false, "Signature should be invalid");
  });
});

test("Phase 6: Razorpay Return Signature Verification", async (t) => {
  await t.test("Valid checkout return signature passes", () => {
    process.env.RAZORPAY_KEY_SECRET = "test_key_secret";
    
    const orderId = "order_123";
    const paymentId = "pay_456";
    const body = orderId + "|" + paymentId;
    const signature = crypto.createHmac("sha256", "test_key_secret").update(body).digest("hex");
    
    const isValid = verifyRazorpaySignature(orderId, paymentId, signature);
    assert.strictEqual(isValid, true, "Checkout return signature should be valid");
  });
});
