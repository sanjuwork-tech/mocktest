"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, TrendingUp, ArrowLeft, Trophy, AlertTriangle } from "lucide-react";

interface AnalyticsData {
  totalParticipants: number;
  averageScore: number;
  maxPossibleScore: number;
  highScore: number | null;
  lowScore: number | null;
  distribution: { range: string; count: number }[];
  recentAttempts: {
    id: string;
    studentName: string;
    score: number;
    maxScore: number;
    submittedAt: string;
  }[];
}

export default function AdminAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/tests/${testId}/analytics`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [testId]);

  if (error) {
    return <div className="p-8 text-red-500 bg-red-50 rounded-xl m-8">Error: {error}</div>;
  }

  if (!data) {
    return <div className="p-8 flex justify-center"><div className="animate-spin h-8 w-8 border-t-2 border-indigo-600 rounded-full" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Test Analytics</h1>
          <p className="text-slate-500">ID: {testId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Participants</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{data.totalParticipants}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><Users className="w-6 h-6" /></div>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Average Score</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{data.averageScore} <span className="text-sm text-slate-400">/ {data.maxPossibleScore}</span></p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">High Score</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{data.highScore === -Infinity ? 0 : data.highScore}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><Trophy className="w-6 h-6" /></div>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Low Score</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{data.lowScore === Infinity ? 0 : data.lowScore}</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-lg"><AlertTriangle className="w-6 h-6" /></div>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Score Distribution</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.distribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="range" stroke="#64748b" />
              <YAxis allowDecimals={false} stroke="#64748b" />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-0 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Recent Attempts</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm">
            <tr>
              <th className="p-4 font-medium">Attempt ID</th>
              <th className="p-4 font-medium">Student User ID</th>
              <th className="p-4 font-medium text-right">Score</th>
              <th className="p-4 font-medium text-right">Accuracy</th>
              <th className="p-4 font-medium text-right">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {data.recentAttempts.map((attempt: any) => (
              <tr key={attempt.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-mono text-slate-500">{attempt.id.split("-")[0]}...</td>
                <td className="p-4 font-mono text-slate-600">{attempt.userId}</td>
                <td className="p-4 text-right font-medium text-slate-900">{attempt.score}</td>
                <td className="p-4 text-right text-slate-600">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    attempt.accuracy >= 80 ? 'bg-emerald-100 text-emerald-700' :
                    attempt.accuracy >= 50 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {attempt.accuracy}%
                  </span>
                </td>
                <td className="p-4 text-right text-slate-500">
                  {new Date(attempt.submittedAt).toLocaleDateString()} {new Date(attempt.submittedAt).toLocaleTimeString()}
                </td>
              </tr>
            ))}
            {data.recentAttempts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No attempts finalized yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
