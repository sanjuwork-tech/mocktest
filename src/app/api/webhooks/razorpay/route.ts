import { verifyWebhookSignature } from "@/server/razorpay";
import { requireDb } from "@/db/client";
import { ordersTable, auditLogTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { grantPaidEntitlement } from "@/server/entitlements";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const db = requireDb();
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    if (!verifyWebhookSignature(rawBody, signature)) {
      return new Response("Invalid signature", { status: 400 });
    }

    const payload = JSON.parse(rawBody);

    // We only care about payment.captured or order.paid
    if (payload.event === "payment.captured") {
      const payment = payload.payload.payment.entity;
      // We stored our internal order_id in notes when creating the razorpay order
      const orderId = payment.notes?.order_id;

      if (!orderId) {
        return new Response("Missing internal order_id in notes", { status: 400 });
      }

      // 1. Transaction to update order and grant entitlement idempotently
      await db.transaction(async (tx) => {
        // Lock the order row
        const [order] = await tx
          .select()
          .from(ordersTable)
          .where(eq(ordersTable.id, orderId))
          .for("update");

        if (!order) {
          throw new Error("Order not found");
        }

        if (order.paymentStatus === "paid") {
          // Idempotent: already processed
          return;
        }

        // Verify amount
        if (order.amountMinor !== payment.amount) {
          throw new Error("Payment amount mismatch");
        }

        // Mark order paid
        await tx
          .update(ordersTable)
          .set({
            paymentStatus: "paid",
            paymentReference: payment.id,
          })
          .where(eq(ordersTable.id, orderId));

        // Grant entitlement
        await grantPaidEntitlement(order.userId!, order.productId!, order.id, tx);

        // Audit log
        await tx.insert(auditLogTable).values({
          actorId: order.userId!, // Webhook acting on behalf of user
          action: "payment.captured",
          entityType: "order",
          entityId: order.id,
          details: {
            paymentId: payment.id,
            amount: payment.amount,
            method: payment.method,
          },
        });
      });

      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ status: "ignored" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
