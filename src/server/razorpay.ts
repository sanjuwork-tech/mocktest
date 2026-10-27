import "server-only";
import Razorpay from "razorpay";
import crypto from "crypto";
import { safeEqual } from "./security.ts";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

let client: Razorpay | null = null;

// Created on first use so a missing key fails the request, never falls back to a known secret.
export function getRazorpay() {
  client ??= new Razorpay({
    key_id: requiredEnv("RAZORPAY_KEY_ID"),
    key_secret: requiredEnv("RAZORPAY_KEY_SECRET"),
  });
  return client;
}

function hmacHex(secret: string, body: string) {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  return safeEqual(hmacHex(secret, `${orderId}|${paymentId}`), signature);
}

export function verifyWebhookSignature(body: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  return safeEqual(hmacHex(secret, body), signature);
}
