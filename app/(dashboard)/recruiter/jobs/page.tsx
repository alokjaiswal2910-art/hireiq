"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ANIMATION_VARIANTS } from "@/lib/constants";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { getJobsByRecruiter } from "@/app/actions/jobs";
import type { Job } from "@/lib/types";

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJobsByRecruiter().then((res) => {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-syne font-bold text-2xl md:text-3xl text-white">My Jobs</h1>
        <Link href="/recruiter/jobs/new">
          <PrimaryButton className="text-sm">Post New Job</PrimaryButton>
        </Link>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center text-slate-500">Loading...</div>
      ) : jobs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-400 mb-6">You haven&apos;t posted any jobs yet.</p>
          <Link href="/recruiter/jobs/new">
            <PrimaryButton>Post your first job</PrimaryButton>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              variants={ANIMATION_VARIANTS.fadeUp}
              className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <h2 className="font-syne font-bold text-lg text-white">{job.title}</h2>
                <p className="text-slate-400 text-sm mt-1 line-clamp-2">{job.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(job.required_skills ?? []).slice(0, 4).map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-white/5 text-slate-400 text-xs">{s}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link href={`/recruiter/candidates/${job.id}`}>
                  <PrimaryButton className="text-sm">View Candidates</PrimaryButton>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
