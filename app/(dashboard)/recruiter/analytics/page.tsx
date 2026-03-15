"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ANIMATION_VARIANTS } from "@/lib/constants";
import { getRecruiterStats } from "@/app/actions/recruiter";

export default function RecruiterAnalyticsPage() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getRecruiterStats>>["data"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecruiterStats().then((res) => {
      if (res.data) setStats(res.data);
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
      <h1 className="font-syne font-bold text-2xl md:text-3xl text-white">Analytics</h1>
      <p className="text-slate-400 text-sm">Overview of your hiring pipeline.</p>

      {loading ? (
        <div className="glass-card p-12 text-center text-slate-500">Loading...</div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="glass-card p-6">
            <div className="text-3xl font-syne font-bold text-white">{stats.total_jobs}</div>
            <div className="text-slate-400 text-sm mt-1">Jobs Posted</div>
          </motion.div>
          <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="glass-card p-6">
            <div className="text-3xl font-syne font-bold text-white">{stats.total_applications}</div>
            <div className="text-slate-400 text-sm mt-1">Total Applicants</div>
          </motion.div>
          <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="glass-card p-6">
            <div className="text-3xl font-syne font-bold text-white">{stats.total_interviews_completed}</div>
            <div className="text-slate-400 text-sm mt-1">Interviews Completed</div>
          </motion.div>
          <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="glass-card p-6">
            <div className="text-3xl font-syne font-bold text-white">{stats.average_score}%</div>
            <div className="text-slate-400 text-sm mt-1">Average Score</div>
          </motion.div>
        </div>
      ) : null}
      {stats?.top_candidate && (
        <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="glass-card p-6">
          <h3 className="font-syne font-bold text-white text-sm uppercase tracking-widest mb-2">Top Candidate</h3>
          <p className="text-slate-300">{stats.top_candidate.name} — {stats.top_candidate.job_title} ({stats.top_candidate.score}%)</p>
        </motion.div>
      )}
    </motion.div>
  );
}
