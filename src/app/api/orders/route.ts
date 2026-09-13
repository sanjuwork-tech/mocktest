import { NextResponse } from "next/server";
import { z } from "zod";
import { productBySlug } from "@/data/catalog";
import { db } from "@/db/client";
import { ordersTable } from "@/db/schema";

const orderInput = z.object({ customerName: z.string().min(2), email: z.email(), phone: z.string().min(8).max(16).optional(), productSlug: z.string().min(2) });

export async function POST(request: Request) {
  const parsed = orderInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const product = productBySlug(parsed.data.productSlug);
  if (!product) return NextResponse.json({ error: "Unknown product" }, { status: 404 });
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const [order] = await db.insert(ordersTable).values({ ...parsed.data, amount: product.price }).returning();
  return NextResponse.json({ order, paymentRequired: true }, { status: 201 });
}
