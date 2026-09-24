import Razorpay from "razorpay";
import crypto from "crypto";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mock",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_secret",
});

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
) {
  const secret = process.env.RAZORPAY_KEY_SECRET || "mock_secret";
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body.toString())
    .digest("hex");

  return expectedSignature === signature;
}

export function verifyWebhookSignature(body: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "mock_webhook_secret";
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}
