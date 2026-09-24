import { apiError, ApiError, requireOrigin } from "@/server/http";
import { currentStudent } from "@/server/student-auth";
import { requireDb } from "@/db/client";
import { productsTable, ordersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { razorpay } from "@/server/razorpay";
import { z } from "zod";
import crypto from "crypto";

export const runtime = "nodejs";

const CreateOrderSchema = z.object({
  productSlug: z.string(),
  customerName: z.string(),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    requireOrigin(request);
    
    // Auth check
    const session = await currentStudent();
    if (!session) {
      throw new ApiError(401, "You must be logged in to purchase.");
    }
    
    const body = await request.json();
    const data = CreateOrderSchema.parse(body);

    const db = requireDb();

    // Validate product
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.slug, data.productSlug))
      .limit(1);

    if (!product) {
      throw new ApiError(404, "Product not found.");
    }

    if (!product.priceMinor) {
      throw new ApiError(400, "Product price is not configured for purchase.");
    }

    const idempotencyKey = crypto.randomUUID();

    // 1. Create order in Database
    const [order] = await db.insert(ordersTable).values({
      customerName: data.customerName,
      email: session.email,
      phone: data.phone || null,
      productSlug: product.slug,
      amountMinor: product.priceMinor,
      currency: "INR",
      userId: session.id,
      productId: product.id,
      paymentStatus: "pending",
      idempotencyKey,
    }).returning();

    // 2. Create order in Razorpay
    const options = {
      amount: product.priceMinor,
      currency: "INR",
      receipt: `rcpt_${order.id.split('-')[0]}`,
      notes: {
        order_id: order.id,
        user_id: session.id,
      },
    };
    
    const rzpOrder = await razorpay.orders.create(options);

    return Response.json({
      success: true,
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount: product.priceMinor,
      currency: "INR",
    });

  } catch (e) {
    if (e instanceof z.ZodError) {
      return apiError(new ApiError(400, "Invalid request payload."));
    }
    return apiError(e);
  }
}
