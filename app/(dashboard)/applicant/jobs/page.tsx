"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ANIMATION_VARIANTS } from "@/lib/constants";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { getJobs } from "@/app/actions/jobs";
import type { Job } from "@/lib/types";

export default function ApplicantJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJobs().then((res) => {
      if (res.data) setJobs(res.data);
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
      <h1 className="font-syne font-bold text-2xl md:text-3xl text-white">Browse Jobs</h1>
      <p className="text-slate-400 text-sm">Apply and start your AI interview.</p>

      {loading ? (
        <div className="glass-card p-12 text-center text-slate-500">Loading...</div>
      ) : jobs.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400">No jobs available right now.</div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              variants={ANIMATION_VARIANTS.fadeUp}
              className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <h2 className="font-syne font-bold text-lg text-white">{job.title}</h2>
                <p className="text-slate-400 text-sm mt-1 line-clamp-2">{job.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(job.required_skills ?? []).slice(0, 5).map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-white/5 text-slate-400 text-xs">{s}</span>
                  ))}
                </div>
                <p className="text-slate-500 text-xs mt-2 capitalize">{job.experience_level} · {job.department ?? "—"}</p>
              </div>
              <Link href={`/applicant/jobs/${job.id}`} className="shrink-0">
                <PrimaryButton className="text-sm">View & Apply</PrimaryButton>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
