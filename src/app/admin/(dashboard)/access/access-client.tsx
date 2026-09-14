"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
};
type Event = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  actorEmail: string | null;
};
export function AccessClient({
  actorId,
  users,
  events,
}: {
  actorId: string;
  users: User[];
  events: Event[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function send(path: string, method: string, data: unknown) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(20000),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Request failed.");
      setMessage("Saved. Access changes apply immediately.");
      router.refresh();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    if (await send("/api/admin/users", "POST", Object.fromEntries(data)))
      form.reset();
  }
  return (
    <main id="main-content" tabIndex={-1} className="page-shell py-12">
      <Link href="/admin" className="text-link">
        ← Preparation inventory
      </Link>
      <p className="eyebrow mt-8">TestDisha · Account administration</p>
      <h1 className="text-4xl font-bold mt-3">Team, access & activity</h1>
      <p className="my-5 max-w-3xl leading-7">
        Editors manage drafts. Reviewers can publish preparation series. Admins
        manage accounts and revoke sessions. Passwords are stored as protected
        hashes, never as readable text.
      </p>
      {message && (
        <p role="status" className="p-4 bg-green-50 rounded-xl my-4">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="p-4 bg-red-50 text-red-900 rounded-xl my-4">
          {error}
        </p>
      )}
      <section className="rounded-2xl border border-navy/20 bg-white p-6 my-8">
        <h2 className="text-2xl font-bold">Add a team member</h2>
        <form onSubmit={create} className="grid sm:grid-cols-2 gap-4 mt-5">
          <label>
            Name
            <input
              name="name"
              required
              minLength={2}
              maxLength={100}
              className="border rounded-lg p-3 w-full mt-2"
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="off"
              className="border rounded-lg p-3 w-full mt-2"
            />
          </label>
          <label>
            Role
            <select
              name="role"
              defaultValue="editor"
              className="border rounded-lg p-3 w-full mt-2"
            >
              <option value="editor">Editor — draft content</option>
              <option value="reviewer">Reviewer — publish content</option>
              <option value="admin">Admin — manage access</option>
            </select>
          </label>
          <label>
            Initial password
            <input
              name="password"
              type="password"
              required
              minLength={12}
              maxLength={128}
              autoComplete="new-password"
              className="border rounded-lg p-3 w-full mt-2"
            />
            <span className="text-xs">
              12–128 characters. Share privately with the account owner.
            </span>
          </label>
          <button
            disabled={busy}
            className="button-primary sm:col-span-2 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Create team account"}
          </button>
        </form>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-5">Team accounts</h2>
        <div className="grid gap-4">
          {users.map((user) => (
            <article
              key={user.id}
              className="p-5 border rounded-2xl bg-white flex flex-wrap justify-between items-center gap-4"
            >
              <div>
                <h3 className="font-bold">
                  {user.name}
                  {user.id === actorId ? " (you)" : ""}
                </h3>
                <p className="text-sm mt-1">
                  {user.email} · {user.role} ·{" "}
                  {user.active ? "Active" : "Disabled"}
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  className="button-secondary disabled:opacity-40"
                  disabled={busy || user.id === actorId}
                  onClick={() =>
                    send(`/api/admin/users/${user.id}`, "PATCH", {
                      active: !user.active,
                    })
                  }
                >
                  {user.active ? "Disable account" : "Enable account"}
                </button>
                <button
                  className="button-secondary disabled:opacity-40"
                  disabled={busy}
                  onClick={async () => {
                    if (
                      await send(`/api/admin/users/${user.id}`, "PATCH", {
                        revokeSessions: true,
                      })
                    )
                      if (user.id === actorId) router.push("/admin/login");
                  }}
                >
                  Sign out all sessions
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="my-10">
        <h2 className="text-2xl font-bold mb-5">
          Recent security & content activity
        </h2>
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="text-sm w-full text-left">
            <thead>
              <tr>
                <th className="p-4">Action</th>
                <th className="p-4">Account</th>
                <th className="p-4">When</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-4">{e.action}</td>
                  <td className="p-4">
                    {e.actorEmail ??
                      (e.action === "login.failed"
                        ? "Unauthenticated attempt"
                        : "System or removed account")}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {new Date(e.createdAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                    })}{" "}
                    IST
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
