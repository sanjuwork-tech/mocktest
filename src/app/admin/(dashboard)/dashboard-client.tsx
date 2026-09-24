"use client";
import Link from "next/link";
import { BookOpen, Compass, Layers, LogOut, Plus, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import { requestError } from "@/lib/request-error";

export type InventoryProduct = {
  id: string;
  slug: string;
  exam: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice: number;
  mockCount: number;
  published: boolean;
  featured: boolean;
};
export function DashboardClient({
  products,
  databaseState,
  role,
}: {
  products: InventoryProduct[];
  role: "admin" | "reviewer" | "editor";
  databaseState: "ready" | "unconfigured" | "unavailable";
}) {
  const router = useRouter();
  const [editor, setEditor] = useState<InventoryProduct | "new" | null>(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const pending = useRef(false);
  const existing = editor && editor !== "new" ? editor : null;
  const visible = products.filter((product) =>
    `${product.title} ${product.exam} ${product.slug}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  function openEditor(product: InventoryProduct | "new") {
    setError("");
    setMessage("");
    setEditor(product);
  }
  async function logout() {
    setSigningOut(true);
    setError("");
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok)
        throw new Error("Could not sign out. Please try again.");
      router.push("/admin/login");
      router.refresh();
    } catch {
      setError("Could not sign out. Check your connection and try again.");
    } finally {
      setSigningOut(false);
    }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get("title")),
      description: String(form.get("description")),
      price: Number(form.get("price")),
      compareAtPrice: Number(form.get("compareAtPrice")),
      mockCount: Number(form.get("mockCount")),
      published: form.get("published") === "on",
      featured: form.get("featured") === "on",
      ...(!existing ? { slug: form.get("slug"), exam: form.get("exam") } : {}),
    };
    if (payload.compareAtPrice < payload.price) {
      setError("Compare-at price must be at least the price.");
      return;
    }
    pending.current = true;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        existing ? `/api/products/${existing.id}` : "/api/products",
        {
          method: existing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(15000),
        },
      );
      if (!response.ok)
        throw new Error(
          requestError(
            await response.json().catch(() => null),
            "Could not save. Refresh inventory before retrying.",
          ),
        );
      setMessage(existing ? "Series updated." : "Series created.");
      setEditor(null);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error && error.name === "Error"
          ? error.message
          : "Connection interrupted. Refresh inventory before retrying to check whether your change was saved.",
      );
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page-shell py-12 min-h-[70vh]"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Operations · {role}</p>
          <h1 className="text-4xl font-bold">Preparation inventory</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/questions" className="button-secondary flex items-center gap-2">
            <BookOpen size={16} />
            Question bank
          </Link>
          <Link href="/admin/tests" className="button-secondary flex items-center gap-2">
            <Layers size={16} />
            Test builder
          </Link>
          <Link href="/admin/exam-guide" className="button-secondary flex items-center gap-2">
            <Compass size={16} />
            Exam guide
          </Link>
          <Link href="/admin/imports" className="button-secondary flex items-center gap-2">
            <Upload size={16} />
            Import
          </Link>
          {role === "admin" && (
            <Link href="/admin/access" className="button-secondary">
              Team & access
            </Link>
          )}
          <button
            type="button"
            disabled={databaseState !== "ready"}
            onClick={() => openEditor("new")}
            className="button-primary disabled:opacity-50"
          >
            <Plus size={17} />
            Add series
          </button>
          <button
            type="button"
            disabled={signingOut}
            onClick={logout}
            className="icon-button"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
      <div
        className="rounded-xl border border-navy/20 bg-white p-5 mb-6 text-sm leading-7"
        role="status"
      >
        {databaseState === "ready"
          ? "Inventory loaded from the database."
          : databaseState === "unconfigured"
            ? "Database is not configured. Inventory management is unavailable."
            : "Inventory could not be loaded. Check the database connection and migrations."}
        <p>
          These records are for preparation inventory. The public exam guide is
          maintained separately, and paid enrolment is not available. Published
          records appear on the homepage and Preparation page.
        </p>
      </div>
      {role === "editor" && (
        <p className="mb-5 text-sm">
          You can create and edit drafts. A reviewer or admin must publish them;
          published records are read-only for your role.
        </p>
      )}
      {databaseState === "unavailable" && (
        <button
          type="button"
          className="button-secondary mb-5"
          onClick={() => router.refresh()}
        >
          Retry loading inventory
        </button>
      )}
      <label className="search-field">
        <span>Search inventory</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Title, exam or slug…"
        />
      </label>
      <p className="my-4 text-sm" role="status">
        {visible.length} of {products.length} series ·{" "}
        {products.filter((product) => product.published).length} published
        records
      </p>
      <div className="overflow-x-auto rounded-2xl border border-navy/20 bg-white">
        <table className="w-full min-w-[650px] text-left text-sm">
          <caption className="sr-only">
            Preparation products stored in the database
          </caption>
          <thead className="bg-mist">
            <tr>
              {["Series", "Exam", "Mocks", "Price", "Status", "Action"].map(
                (label) => (
                  <th scope="col" key={label} className="p-4">
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {visible.map((product) => (
              <tr key={product.id} className="border-t border-navy/10">
                <th scope="row" className="p-4">
                  {product.title}
                </th>
                <td className="p-4">{product.exam}</td>
                <td className="p-4">{product.mockCount}</td>
                <td className="p-4">
                  ₹{product.price.toLocaleString("en-IN")}
                </td>
                <td className="p-4">
                  {product.published ? "Published" : "Draft"}
                </td>
                <td className="p-4">
                  <button
                    type="button"
                    className="text-link min-h-11"
                    disabled={role === "editor" && product.published}
                    onClick={() => openEditor(product)}
                    aria-label={`Edit ${product.title}`}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!visible.length && (
        <p className="empty-state mt-4">
          {products.length
            ? "No series match your search."
            : databaseState === "ready"
              ? "No products yet. Add a series to create your first draft."
              : "Inventory is unavailable."}
        </p>
      )}
      {message && (
        <p role="status" className="mt-5 rounded-xl bg-lime p-4 text-sm">
          {message}
        </p>
      )}
      {error && !editor && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 text-red-800 p-4">
          {error}
        </p>
      )}
      <Modal
        open={editor !== null}
        onClose={() => setEditor(null)}
        titleId="editor-title"
      >
        {editor && (
          <form key={existing?.id ?? "new"} onSubmit={save} aria-busy={saving}>
            <div className="flex justify-between items-start gap-4">
              <h2 id="editor-title" className="text-2xl font-bold">
                {existing ? "Edit series" : "Add test series"}
              </h2>
              <button
                type="button"
                onClick={() => setEditor(null)}
                className="icon-button"
                aria-label="Close series editor"
              >
                <X size={18} />
              </button>
            </div>
            <fieldset disabled={saving} className="mt-6 space-y-4">
              <AdminInput
                name="title"
                label="Title"
                value={existing?.title}
                minLength={4}
              />
              {!existing && (
                <>
                  <AdminInput
                    name="slug"
                    label="URL slug"
                    minLength={2}
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  />
                  <AdminInput name="exam" label="Exam name" minLength={2} />
                </>
              )}
              <div className="grid gap-4 sm:grid-cols-3">
                <AdminInput
                  name="mockCount"
                  label="Mock count"
                  type="number"
                  value={existing?.mockCount}
                />
                <AdminInput
                  name="price"
                  label="Price (INR)"
                  type="number"
                  value={existing?.price}
                />
                <AdminInput
                  name="compareAtPrice"
                  label="Compare-at (INR)"
                  type="number"
                  value={existing?.compareAtPrice}
                />
              </div>
              <label className="block">
                <span className="block text-sm font-bold mb-2">
                  Description
                </span>
                <textarea
                  required
                  minLength={20}
                  maxLength={5000}
                  name="description"
                  rows={4}
                  defaultValue={existing?.description}
                  className="w-full rounded-xl border border-navy/30 bg-white p-3"
                />
              </label>
              <label className="flex gap-3 text-sm py-2">
                <input
                  name="published"
                  disabled={role === "editor"}
                  type="checkbox"
                  defaultChecked={existing?.published ?? false}
                />
                Published inventory record
              </label>
              <label className="flex gap-3 text-sm py-2">
                <input
                  name="featured"
                  type="checkbox"
                  defaultChecked={existing?.featured ?? false}
                />
                Featured
              </label>
              {error && (
                <p
                  role="alert"
                  className="text-sm text-red-800 bg-red-50 rounded-xl p-3"
                >
                  {error}
                </p>
              )}
              <button className="button-primary w-full" disabled={saving}>
                {saving
                  ? "Saving…"
                  : existing
                    ? "Save changes"
                    : "Create series"}
              </button>
            </fieldset>
          </form>
        )}
      </Modal>
    </main>
  );
}
function AdminInput({
  name,
  label,
  type = "text",
  value,
  minLength,
  pattern,
}: {
  name: string;
  label: string;
  type?: string;
  value?: string | number;
  minLength?: number;
  pattern?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="block mb-2 text-sm font-bold">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={value}
        required
        minLength={minLength}
        maxLength={type === "text" ? 200 : undefined}
        pattern={pattern}
        min={type === "number" ? 0 : undefined}
        max={type === "number" ? 2147483647 : undefined}
        step={
          type === "number"
            ? name === "price" || name === "compareAtPrice"
              ? 0.01
              : 1
            : undefined
        }
        className="w-full rounded-xl border border-navy/30 bg-white p-3"
      />
    </label>
  );
}
