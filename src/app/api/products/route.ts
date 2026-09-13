import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { products } from "@/data/catalog";
import { db } from "@/db/client";
import { productsTable } from "@/db/schema";
import { isAdmin } from "@/lib/admin-auth";

const productInput = z.object({ slug: z.string().min(2), exam: z.string().min(2), title: z.string().min(4), description: z.string().min(20), price: z.number().int().positive(), compareAtPrice: z.number().int().positive(), mockCount: z.number().int().positive(), published: z.boolean().default(false), featured: z.boolean().default(false) });

export async function GET() {
  if (!db) return NextResponse.json({ source: "seed", products });
  return NextResponse.json({ source: "database", products: await db.select().from(productsTable).orderBy(desc(productsTable.createdAt)) });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!db) return NextResponse.json({ error: "DATABASE_URL is not configured." }, { status: 503 });
  const parsed = productInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const [created] = await db.insert(productsTable).values(parsed.data).returning();
  return NextResponse.json(created, { status: 201 });
}
