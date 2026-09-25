"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

type RevenueMonth = {
  month: string;
  revenue: number;
  orders: number;
  paid: number;
};

type TestPerf = {
  testId: string;
  testTitle: string;
  productTitle: string;
  attempts: number;
  completed: number;
  avgScore: number;
  avgMaxScore: number;
  avgPercent: number;
};

type TopProduct = {
  productSlug: string;
  orders: number;
  revenue: number;
};

type StudentMonth = {
  month: string;
  totalAttempts: number;
  uniqueStudents: number;
};

type ReportsData = {
  revenueByMonth: RevenueMonth[];
  testPerformance: TestPerf[];
  topProducts: TopProduct[];
  studentActivity: StudentMonth[];
};

export function ReportsClient() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/reports", {
          signal: AbortSignal.timeout(20000),
        });
        if (!res.ok) throw new Error();
        setData(await res.json());
      } catch {
        setError("Could not load reports. Check connection and try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalRevenue = data?.revenueByMonth.reduce((s, r) => s + r.revenue, 0) ?? 0;
  const totalPaid = data?.revenueByMonth.reduce((s, r) => s + r.paid, 0) ?? 0;
  const totalAttempts = data?.studentActivity.reduce((s, a) => s + a.totalAttempts, 0) ?? 0;
  const maxRevenue = data?.revenueByMonth.length
    ? Math.max(...data.revenueByMonth.map((r) => r.revenue))
    : 1;

  return (
    <main id="main-content" tabIndex={-1} className="page-shell py-12 min-h-[70vh]">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Operations</p>
          <h1 className="text-4xl font-bold">Reports & Analytics</h1>
        </div>
        <Link href="/admin" className="button-secondary flex items-center gap-2">
          <ArrowLeft size={16} /> Dashboard
        </Link>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 text-red-800 p-4 mb-6">
          {error}
        </p>
      )}

      {loading && <p className="py-12 text-center">Loading reports…</p>}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3 my-8">
            <StatCard
              icon={<TrendingUp size={20} />}
              label="All-Time Revenue"
              value={`₹${totalRevenue.toLocaleString("en-IN")}`}
            />
            <StatCard
              icon={<BarChart3 size={20} />}
              label="Paid Orders"
              value={String(totalPaid)}
            />
            <StatCard
              icon={<Users size={20} />}
              label="Test Attempts"
              value={String(totalAttempts)}
            />
          </div>

          <section className="mb-10" aria-labelledby="revenue-title">
            <h2 id="revenue-title" className="text-xl font-bold mb-4">
              Monthly Revenue
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-navy/20 bg-white p-5">
              {data.revenueByMonth.length === 0 ? (
                <p className="text-sm opacity-60">No revenue data yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.revenueByMonth.map((r) => (
                    <div key={r.month} className="flex items-center gap-4">
                      <span className="w-20 text-sm font-mono shrink-0">{r.month}</span>
                      <div className="flex-1 bg-mist rounded-lg overflow-hidden h-7">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center px-2 text-xs text-white font-bold transition-all"
                          style={{
                            width: `${Math.max(2, (r.revenue / maxRevenue) * 100)}%`,
                          }}
                        >
                          {r.revenue > 0 ? `₹${r.revenue.toLocaleString("en-IN")}` : ""}
                        </div>
                      </div>
                      <span className="text-xs opacity-50 w-24 text-right shrink-0">
                        {r.paid}/{r.orders} paid
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="mb-10" aria-labelledby="products-title">
            <h2 id="products-title" className="text-xl font-bold mb-4">
              Revenue by Product
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-navy/20 bg-white">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Revenue by product</caption>
                <thead className="bg-mist">
                  <tr>
                    {["Product", "Orders", "Revenue"].map((h) => (
                      <th scope="col" key={h} className="p-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((p) => (
                    <tr key={p.productSlug} className="border-t border-navy/10">
                      <th scope="row" className="p-4">{p.productSlug}</th>
                      <td className="p-4">{p.orders}</td>
                      <td className="p-4">₹{p.revenue.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                  {!data.topProducts.length && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center">No product data yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-10" aria-labelledby="tests-title">
            <h2 id="tests-title" className="text-xl font-bold mb-4">
              Test Performance
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-navy/20 bg-white">
              <table className="w-full min-w-[600px] text-left text-sm">
                <caption className="sr-only">Test performance summary</caption>
                <thead className="bg-mist">
                  <tr>
                    {["Test", "Series", "Attempts", "Completed", "Avg Score"].map((h) => (
                      <th scope="col" key={h} className="p-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.testPerformance.map((t) => (
                    <tr key={t.testId} className="border-t border-navy/10">
                      <th scope="row" className="p-4">{t.testTitle}</th>
                      <td className="p-4">{t.productTitle}</td>
                      <td className="p-4">{t.attempts}</td>
                      <td className="p-4">{t.completed}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-mist rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${t.avgPercent}%` }}
                            />
                          </div>
                          <span className="text-xs">{t.avgPercent}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!data.testPerformance.length && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center">No test data yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-10" aria-labelledby="activity-title">
            <h2 id="activity-title" className="text-xl font-bold mb-4">
              Student Activity
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-navy/20 bg-white">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Monthly student activity</caption>
                <thead className="bg-mist">
                  <tr>
                    {["Month", "Test Attempts", "Unique Students"].map((h) => (
                      <th scope="col" key={h} className="p-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.studentActivity.map((a) => (
                    <tr key={a.month} className="border-t border-navy/10">
                      <th scope="row" className="p-4 font-mono">{a.month}</th>
                      <td className="p-4">{a.totalAttempts}</td>
                      <td className="p-4">{a.uniqueStudents}</td>
                    </tr>
                  ))}
                  {!data.studentActivity.length && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center">No activity data yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-navy/20 bg-white p-5 flex items-start gap-4">
      <div className="rounded-lg bg-mist p-2">{icon}</div>
      <div>
        <p className="text-sm opacity-60 mb-1">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
