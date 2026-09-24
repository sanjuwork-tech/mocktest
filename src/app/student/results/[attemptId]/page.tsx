"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Target,
  Trophy,
  ArrowLeft,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { RichText } from "@/components/student/rich-text";

// ────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────

type QuestionDetail = {
  assignmentId: string;
  prompt: string;
  marks: number;
  penalty: number;
  options?: string[];
  answer?: string | string[];
  explanation?: string;
};

type ResultData = {
  attempt: {
    id: string;
    status: string;
    startedAt: string;
    submittedAt: string;
    deadline: string;
  };
  result: {
    score: number;
    maxScore: number;
    breakdown: Record<string, { total: number; attempted: number; correct: number; wrong: number; unanswered: number }>;
    answerSnapshot: Record<string, { isAnswered: boolean; isCorrect: boolean; points: number; studentValue: unknown }>;
  };
  test: { title: string };
  sections: unknown[];
  questions: QuestionDetail[];
};

// ────────────────────────────────────────────────────────
// Page Component
// ────────────────────────────────────────────────────────

export default function StudentResultsPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [data, setData] = useState<ResultData | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "review">("overview");

  useEffect(() => {
    fetch(`/api/results/${attemptId}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to load results");
        }
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [attemptId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="bg-red-950/50 border border-red-500/50 rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2 text-red-200">Error Loading Results</h1>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={() => router.push("/student/dashboard")}
            className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const { attempt, result, test, questions } = data;
  const accuracy = result.score > 0 ? Math.round((result.score / result.maxScore) * 100) : 0;
  
  // Format topic data for charts
  const topicData = Object.entries(result.breakdown).map(([topic, stats]) => ({
    topic: topic.substring(0, 15) + (topic.length > 15 ? "..." : ""),
    fullTopic: topic,
    score: (stats.correct / stats.total) * 100,
    correct: stats.correct,
    wrong: stats.wrong,
    unanswered: stats.unanswered,
  }));

  const timeTakenMinutes = Math.round(
    (new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 60000
  );

  return (
    <div className="min-h-screen bg-gray-950 text-slate-300 font-sans selection:bg-indigo-500/30">
      <nav className="border-b border-white/10 bg-gray-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/student/dashboard")}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-white text-lg leading-tight">{test.title}</h1>
              <p className="text-xs text-slate-500">Result & Analysis</p>
            </div>
          </div>
          
          <div className="flex bg-gray-900 rounded-lg p-1 border border-white/5">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === "overview" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("review")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === "review" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              Review Mode
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "overview" ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Score Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-indigo-200 font-medium">Total Score</h3>
                    <Trophy className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">{result.score}</span>
                    <span className="text-indigo-200/60">/ {result.maxScore}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-emerald-200 font-medium">Accuracy</h3>
                    <Target className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">{accuracy}%</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-amber-200 font-medium">Time Taken</h3>
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">{timeTakenMinutes}</span>
                    <span className="text-amber-200/60">mins</span>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Topic Performance (Radar)</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={topicData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="topic" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b' }} />
                        <Radar
                          name="Score %"
                          dataKey="score"
                          stroke="#6366f1"
                          fill="#6366f1"
                          fillOpacity={0.5}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                          formatter={(value: unknown) => [`${Math.round(Number(value))}%`, 'Accuracy']}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Attempt Breakdown</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topicData} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                        <XAxis type="number" stroke="#94a3b8" />
                        <YAxis dataKey="topic" type="category" stroke="#94a3b8" width={100} tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                          cursor={{ fill: '#1e293b' }}
                        />
                        <Bar dataKey="correct" name="Correct" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="wrong" name="Wrong" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="unanswered" name="Skipped" stackId="a" fill="#64748b" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {questions.map((q, idx) => {
                const snap = result.answerSnapshot[q.assignmentId];
                const isCorrect = snap?.isCorrect;
                const isAnswered = snap?.isAnswered;
                
                return (
                  <div key={q.assignmentId} className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden">
                    <div className={`px-6 py-3 border-b flex justify-between items-center ${
                      !isAnswered ? 'bg-slate-900 border-slate-800' :
                      isCorrect ? 'bg-emerald-900/20 border-emerald-900/50' : 'bg-red-900/20 border-red-900/50'
                    }`}>
                      <span className="font-semibold text-white">Q{idx + 1}</span>
                      <div className="flex gap-4 text-sm font-medium">
                        {isCorrect ? (
                          <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Correct (+{q.marks})</span>
                        ) : !isAnswered ? (
                          <span className="text-slate-400 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Unanswered (0)</span>
                        ) : (
                          <span className="text-red-400 flex items-center gap-1"><XCircle className="w-4 h-4" /> Incorrect (-{q.penalty})</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      <div className="prose prose-invert max-w-none prose-p:leading-relaxed">
                        <RichText text={q.prompt} />
                      </div>
                      
                      {q.options && q.options.length > 0 && (
                        <div className="space-y-3">
                          {q.options.map((opt: string, optIdx: number) => {
                            const isCorrectOpt = Array.isArray(q.answer) ? q.answer.includes(String(optIdx)) : String(q.answer) === String(optIdx);
                            const isSelectedOpt = Array.isArray(snap?.studentValue) ? snap?.studentValue.includes(String(optIdx)) : String(snap?.studentValue) === String(optIdx);
                            
                            return (
                              <div key={optIdx} className={`p-4 rounded-lg border flex gap-4 ${
                                isCorrectOpt ? 'border-emerald-500/50 bg-emerald-500/10' :
                                isSelectedOpt ? 'border-red-500/50 bg-red-500/10' :
                                'border-white/5 bg-white/5'
                              }`}>
                                <div className="mt-0.5">
                                  {isCorrectOpt && isSelectedOpt && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                  {!isCorrectOpt && isSelectedOpt && <XCircle className="w-5 h-5 text-red-500" />}
                                  {isCorrectOpt && !isSelectedOpt && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                  {!isCorrectOpt && !isSelectedOpt && <div className="w-5 h-5 rounded-full border-2 border-white/20" />}
                                </div>
                                <div className="flex-1"><RichText text={opt} /></div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-lg p-5 mt-8">
                        <h4 className="text-indigo-300 font-bold mb-3 uppercase tracking-wider text-xs">Explanation</h4>
                        <div className="prose prose-invert max-w-none text-slate-300">
                          <RichText text={q.explanation || "No explanation provided."} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
