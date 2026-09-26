import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { currentAdmin, recentAudit } from "@/server/auth";
import { requireDb, db } from "@/db/client";
import { usersTable } from "@/db/schema";
import { AccessClient } from "./access-client";
export default async function AccessPage() {
  const actor = await currentAdmin();
  if (actor?.role !== "admin") redirect("/admin");
  let users: any[] = [];
  let events: any[] = [];

  try {
    if (db) {
      users = await requireDb()
        .select({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          role: usersTable.role,
          active: usersTable.active,
        })
        .from(usersTable)
        .orderBy(desc(usersTable.createdAt));
      
      events = await recentAudit();
    }
  } catch (e) {
    // Gracefully handle query errors if DB is unreachable
  }

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
