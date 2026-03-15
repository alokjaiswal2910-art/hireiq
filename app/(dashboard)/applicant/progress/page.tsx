"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ANIMATION_VARIANTS } from "@/lib/constants";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { getApplicantProgress } from "@/app/actions/progress";

export default function ApplicantProgressPage() {
  const [progress, setProgress] = useState<Awaited<ReturnType<typeof getApplicantProgress>>["data"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApplicantProgress().then((res) => {
      if (res.data) setProgress(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={ANIMATION_VARIANTS.staggerContainer}
      className="flex flex-col gap-6 pb-12"
    >
      <h1 className="font-syne font-bold text-2xl md:text-3xl text-white">My Progress</h1>
      <p className="text-slate-400 text-sm">Track your interview performance over time.</p>

      {loading ? (
        <div className="glass-card p-12 text-center text-slate-500">Loading...</div>
      ) : !progress ? (
        <div className="glass-card p-12 text-center text-slate-400">Could not load progress.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="glass-card p-6 text-center">
              <div className="text-3xl font-syne font-bold text-white">{progress.total_interviews}</div>
              <div className="text-slate-400 text-sm mt-1">Total Interviews</div>
            </motion.div>
            <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="glass-card p-6 text-center">
              <div className="text-3xl font-syne font-bold text-white">{progress.best_score}%</div>
              <div className="text-slate-400 text-sm mt-1">Best Score</div>
            </motion.div>
            <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="glass-card p-6 text-center">
              <div className="text-3xl font-syne font-bold text-white">{progress.average_score}%</div>
              <div className="text-slate-400 text-sm mt-1">Average Score</div>
            </motion.div>
            <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="glass-card p-6 text-center">
              <div className="text-3xl font-syne font-bold text-emerald-400">{progress.improvement > 0 ? `+${progress.improvement}%` : `${progress.improvement}%`}</div>
              <div className="text-slate-400 text-sm mt-1">Improvement</div>
            </motion.div>
          </div>
          <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="glass-card p-6">
            <h3 className="font-syne font-bold text-white text-sm uppercase tracking-widest mb-4">Interview History</h3>
            {progress.interviews.length === 0 ? (
              <p className="text-slate-500 text-sm">No completed interviews yet.</p>
            ) : (
              <ul className="space-y-3">
                {progress.interviews.map((inv, i) => (
                  <li key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-white text-sm">{inv.job_title}</span>
                    <span className="text-slate-400 text-sm">{inv.overall_score}% · {inv.recommendation_label}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
          <Link href="/applicant/resume">
            <PrimaryButton>Practice More</PrimaryButton>
          </Link>
        </>
      )}
    </motion.div>
  );
}
