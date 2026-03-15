"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ASSETS, ANIMATION_VARIANTS } from "@/lib/constants";
import { getAllCandidatesRanked } from "@/app/actions/recruiter";
import type { CandidateRanking } from "@/lib/types";

export default function AllCandidatesPage() {
  const [candidates, setCandidates] = useState<(CandidateRanking & { job_title?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCandidatesRanked().then((res) => {
      if (res.data) setCandidates(res.data);
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
      <div>
        <h1 className="font-syne font-bold text-2xl md:text-3xl text-white">All Candidates</h1>
        <p className="text-slate-400 text-sm mt-1">Ranked by interview score across all jobs</p>
      </div>

      <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-dm-sans border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                <th className="pb-4 pl-6 font-medium">Rank</th>
                <th className="pb-4 px-4 font-medium">Candidate</th>
                <th className="pb-4 px-4 font-medium">Job</th>
                <th className="pb-4 px-4 font-medium">Score</th>
                <th className="pb-4 px-4 font-medium">Recommendation</th>
                <th className="pb-4 pr-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-slate-500">Loading...</td></tr>
              ) : candidates.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-slate-500">No candidates yet.</td></tr>
              ) : (
                candidates.map((row, i) => (
                  <tr key={row.interview_id} className="hover:bg-white/[0.02]">
                    <td className="py-4 pl-6">
                      <span className="font-syne font-bold text-white">#{row.rank ?? i + 1}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10">
                          <Image src={ASSETS.illustrations.avatars[row.full_name.charCodeAt(0) % ASSETS.illustrations.avatars.length]} alt={row.full_name} fill className="object-cover" />
                        </div>
                        <span className="text-white text-sm font-medium">{row.full_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-sm">{row.job_title ?? "—"}</td>
                    <td className="py-4 px-4 font-syne font-bold text-white">{row.overall_score}%</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        row.overall_score >= 80 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        row.overall_score >= 50 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        {row.recommendation_label}
                      </span>
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <Link href={`/recruiter/candidates/report/${row.interview_id}`} className="text-violet-400 hover:text-violet-300 text-sm font-medium">
                        View Report →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
