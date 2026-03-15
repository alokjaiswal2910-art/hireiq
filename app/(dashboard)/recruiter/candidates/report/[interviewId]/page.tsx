"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { ANIMATION_VARIANTS } from "@/lib/constants";
import { getCandidateFullReport } from "@/app/actions/recruiter";

export default function CandidateReportPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.interviewId as string;
  const [report, setReport] = useState<Awaited<ReturnType<typeof getCandidateFullReport>>["data"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCandidateFullReport(interviewId).then((res) => {
      if (res.data) setReport(res.data);
      setLoading(false);
    });
  }, [interviewId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center">
        <div>
          <h2 className="text-xl font-syne font-bold text-white mb-2">Report not found</h2>
          <Link href="/recruiter" className="text-violet-400 hover:text-violet-300">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const { interview, qa, job, applicant, skill_scores } = report;
  const radarData = Object.entries(skill_scores).map(([skill, score]) => ({ skill, score, fullMark: 10 }));

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={ANIMATION_VARIANTS.staggerContainer}
      className="flex flex-col gap-6 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/recruiter" className="text-sm text-slate-400 hover:text-white mb-2 inline-block">← Back to Dashboard</Link>
          <h1 className="font-syne font-bold text-2xl md:text-3xl text-white">
            {applicant.full_name} — {job.title}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Overall: {interview.overall_score ?? 0}/100 · {interview.recommendation_label ?? "N/A"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 h-[320px]">
          <h3 className="font-syne font-bold text-white text-sm uppercase tracking-widest mb-4">Skill breakdown</h3>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height="90%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: "#94A3B8", fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm">No skill scores</p>
          )}
        </div>
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="font-syne font-bold text-emerald-400 text-xs uppercase tracking-widest">Strengths</h3>
          <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
            {(interview.strengths ?? []).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          <h3 className="font-syne font-bold text-amber-400 text-xs uppercase tracking-widest mt-2">Improvements</h3>
          <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
            {(interview.improvements ?? []).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass-card p-6 border-l-2 border-l-violet-500">
        <h3 className="font-syne font-bold text-violet-400 text-xs uppercase tracking-widest mb-2">AI Recommendation</h3>
        <p className="text-slate-300 text-sm">{interview.hiring_recommendation ?? "—"}</p>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-syne font-bold text-white text-sm uppercase tracking-widest mb-4">Q&A</h3>
        <div className="flex flex-col gap-3">
          {qa.map((row, i) => (
            <details key={row.id} className="group border border-white/5 rounded-lg overflow-hidden">
              <summary className="p-4 cursor-pointer list-none flex justify-between items-center">
                <span className="text-white text-sm font-medium">Q{row.question_number}: {row.question?.slice(0, 60)}…</span>
                <span className="text-violet-400 text-xs font-bold">{row.score ?? 0}/10</span>
              </summary>
              <div className="p-4 border-t border-white/5 bg-white/[0.02] text-sm text-slate-300 space-y-2">
                <p><strong className="text-slate-400">Answer:</strong> {row.applicant_answer ?? "—"}</p>
                <p><strong className="text-slate-400">Feedback:</strong> {row.ai_feedback ?? "—"}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
