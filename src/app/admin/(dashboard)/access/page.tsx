import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { currentAdmin, recentAudit } from "@/server/auth";
import { requireDb } from "@/db/client";
import { usersTable } from "@/db/schema";
import { AccessClient } from "./access-client";
export default async function AccessPage() {
  const actor = await currentAdmin();
  if (actor?.role !== "admin") redirect("/admin");
  const users = await requireDb()
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      active: usersTable.active,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt));
  const events = await recentAudit();
  return (
    <AccessClient
      actorId={actor.userId}
      users={users}
      events={events.map((e) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
      }))}
    />
  );
}
