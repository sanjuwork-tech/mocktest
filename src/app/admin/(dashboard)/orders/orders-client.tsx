"use client";

import Link from "next/link";
import { ArrowLeft, Download, Search } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

type Order = {
  id: string;
  customerName: string;
  email: string;
  phone: string | null;
  productSlug: string;
  amount: number;
  paymentStatus: string;
  paymentReference: string | null;
  createdAt: string;
};

type Summary = {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  todayOrders: number;
  todayRevenue: number;
};

type OrdersData = {
  orders: Order[];
  pagination: { page: number; limit: number; total: number };
  summary: Summary;
};

export function OrdersClient() {
  const [data, setData] = useState<OrdersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));
    try {
      const res = await fetch(`/api/admin/orders?${params}`, {
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error("Failed to load orders.");
      setData(await res.json());
    } catch {
      setError("Could not load orders. Check connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, [fetchOrders]);

  function exportCsv() {
    if (!data?.orders.length) return;
    const headers = [
      "Order ID",
      "Customer",
      "Email",
      "Phone",
      "Product",
      "Amount (₹)",
      "Status",
      "Payment Ref",
      "Date",
    ];
    const rows = data.orders.map((o) => [
      o.id,
      o.customerName,
      o.email,
      o.phone ?? "",
      o.productSlug,
      o.amount.toString(),
      o.paymentStatus,
      o.paymentReference ?? "",
      new Date(o.createdAt).toLocaleDateString("en-IN"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `testdisha-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalPages = data ? Math.ceil(data.pagination.total / data.pagination.limit) : 0;

  return (
    <main id="main-content" tabIndex={-1} className="page-shell py-12 min-h-[70vh]">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Operations</p>
          <h1 className="text-4xl font-bold">Orders & Revenue</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin" className="button-secondary flex items-center gap-2">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!data?.orders.length}
            className="button-secondary flex items-center gap-2 disabled:opacity-50"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {data?.summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 my-8">
          <StatCard label="Total Revenue" value={`₹${data.summary.totalRevenue.toLocaleString("en-IN")}`} />
          <StatCard label="Total Orders" value={String(data.summary.totalOrders)} sub={`${data.summary.paidOrders} paid · ${data.summary.pendingOrders} pending`} />
          <StatCard label="Today's Orders" value={String(data.summary.todayOrders)} />
          <StatCard label="Today's Revenue" value={`₹${data.summary.todayRevenue.toLocaleString("en-IN")}`} />
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <label className="search-field flex-1 min-w-[200px]">
          <span>Search orders</span>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Name or email…"
              style={{ paddingLeft: "2.25rem" }}
            />
          </div>
        </label>
        <label className="block">
          <span className="block text-sm font-bold mb-2">Status</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-navy/30 bg-white p-3 min-w-[140px]"
          >
            <option value="">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 text-red-800 p-4 mb-4">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-navy/20 bg-white">
        <table className="w-full min-w-[750px] text-left text-sm">
          <caption className="sr-only">Orders</caption>
          <thead className="bg-mist">
            <tr>
              {["Customer", "Email", "Product", "Amount", "Status", "Date", "Ref"].map(
                (label) => (
                  <th scope="col" key={label} className="p-4">
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="p-8 text-center">
                  Loading orders…
                </td>
              </tr>
            )}
            {!loading && data?.orders.map((order) => (
              <tr key={order.id} className="border-t border-navy/10">
                <th scope="row" className="p-4">{order.customerName}</th>
                <td className="p-4">{order.email}</td>
                <td className="p-4">{order.productSlug}</td>
                <td className="p-4">₹{order.amount.toLocaleString("en-IN")}</td>
                <td className="p-4">
                  <span
                    className={`inline-block px-2 py-1 rounded-lg text-xs font-bold ${
                      order.paymentStatus === "paid"
                        ? "bg-lime text-navy"
                        : order.paymentStatus === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="p-4">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="p-4 font-mono text-xs opacity-60">
                  {order.paymentReference?.slice(0, 12) ?? "—"}
                </td>
              </tr>
            ))}
            {!loading && !data?.orders.length && (
              <tr>
                <td colSpan={7} className="p-8 text-center">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="button-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <span className="flex items-center px-4 text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="button-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-navy/20 bg-white p-5">
      <p className="text-sm opacity-60 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs opacity-50 mt-1">{sub}</p>}
    </div>
  );
}
