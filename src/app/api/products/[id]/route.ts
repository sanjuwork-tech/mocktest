import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { productsTable } from "@/db/schema";
import { isAdmin } from "@/lib/admin-auth";

const updateInput = z.object({ title: z.string().min(4).optional(), description: z.string().min(20).optional(), price: z.number().int().positive().optional(), compareAtPrice: z.number().int().positive().optional(), mockCount: z.number().int().positive().optional(), published: z.boolean().optional(), featured: z.boolean().optional() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!db) return NextResponse.json({ error: "DATABASE_URL is not configured." }, { status: 503 });
  const parsed = updateInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { id } = await params;
  const [updated] = await db.update(productsTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(productsTable.id, id)).returning();
  return updated ? NextResponse.json(updated) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!db) return NextResponse.json({ error: "DATABASE_URL is not configured." }, { status: 503 });
  const { id } = await params;
  const [deleted] = await db.delete(productsTable).where(eq(productsTable.id, id)).returning({ id: productsTable.id });
  return deleted ? NextResponse.json(deleted) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
