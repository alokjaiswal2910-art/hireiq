"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ANIMATION_VARIANTS } from "@/lib/constants";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { SecondaryButton } from "@/components/shared/SecondaryButton";
import { SkillBadge } from "@/components/shared/SkillBadge";
import { getJobById } from "@/app/actions/jobs";
import type { Job } from "@/lib/types";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;
    getJobById(jobId).then((res) => {
      if (res.data) setJob(res.data);
      setLoading(false);
    });
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="font-syne font-bold text-xl text-white mb-2">Job not found</h2>
        <Link href="/applicant/jobs">
          <PrimaryButton>Back to Browse Jobs</PrimaryButton>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={ANIMATION_VARIANTS.staggerContainer}
      className="flex flex-col gap-8 pb-12 max-w-4xl"
    >
      <div>
        <Link href="/applicant/jobs" className="text-sm text-slate-400 hover:text-white mb-2 inline-block">← Back to Browse Jobs</Link>
        <h1 className="font-syne font-bold text-2xl md:text-3xl text-white">{job.title}</h1>
        <p className="text-slate-400 text-sm mt-1 capitalize">{job.experience_level} {job.department ? `· ${job.department}` : ''}</p>
      </div>

      <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="glass-card p-6 md:p-8 flex flex-col gap-6">
        <h2 className="font-syne font-bold text-lg text-white border-b border-white/10 pb-2">About this role</h2>
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>

        <div>
          <h3 className="font-syne font-bold text-white text-sm mb-3">Required skills</h3>
          <div className="flex flex-wrap gap-2">
            {(job.required_skills ?? []).map((skill) => (
              <SkillBadge key={skill} skill={skill} type="required" />
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4">
          <Link href={`/applicant/resume?jobId=${job.id}`} className="shrink-0">
            <PrimaryButton className="w-full sm:w-auto">Apply & upload resume</PrimaryButton>
          </Link>
          <Link href="/applicant/jobs">
            <SecondaryButton className="w-full sm:w-auto">Browse other jobs</SecondaryButton>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
