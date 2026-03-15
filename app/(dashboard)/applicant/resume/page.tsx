"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ANIMATION_VARIANTS } from "@/lib/constants";
import { ResumeUploader } from "@/components/applicant/ResumeUploader";
import { SkillBadge } from "@/components/shared/SkillBadge";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { SecondaryButton } from "@/components/shared/SecondaryButton";
import { getJobs } from "@/app/actions/jobs";
import type { Job } from "@/lib/types";

function ResumePageContent() {
  const searchParams = useSearchParams();
  const jobIdFromUrl = searchParams.get("jobId");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      const res = await getJobs();
      if (res.data?.length) {
        setJobs(res.data);
        const preferred = jobIdFromUrl ? res.data.find((j) => j.id === jobIdFromUrl) : null;
        setSelectedJob(preferred ?? res.data[0]);
      }
      setLoading(false);
    }
    fetchJobs();
  }, [jobIdFromUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
          <span className="text-slate-400 font-dm-sans">Loading job context...</span>
        </div>
      </div>
    );
  }

  if (!loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-syne font-bold text-white mb-2">No Jobs Found</h2>
          <p className="text-slate-400 mb-6">There are no jobs available for application right now.</p>
          <PrimaryButton onClick={() => window.location.reload()}>Refresh Page</PrimaryButton>
        </div>
      </div>
    );
  }

  const job = selectedJob ?? jobs[0];
  if (!job) return null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={ANIMATION_VARIANTS.staggerContainer}
      className="flex flex-col gap-8 pb-12 w-full"
    >
      <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="mb-2">
        <h1 className="font-syne font-bold text-3xl md:text-4xl text-white mb-2">
          Resume Analysis
        </h1>
        <p className="font-dm-sans text-slate-400">
          Upload your resume to see how well it matches the job role.
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8 w-full">
        <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="w-full lg:w-[60%] shrink-0">
          <ResumeUploader 
            jobId={job.id}
            jobTitle={job.title}
            jobDescription={job.description}
            requiredSkills={job.required_skills ?? []}
            experienceLevel={job.experience_level ?? 'mid'}
          />
        </motion.div>

        <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="w-full lg:w-[40%] flex flex-col gap-6">
          <div className="glass-card p-6 flex flex-col relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-full h-1 bg-violet-500" />
            <span className="text-violet-400 font-bold tracking-widest text-[10px] uppercase mb-4">
              Target Role
            </span>
            {jobs.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {jobs.map((j) => (
                  <button
                    key={j.id}
                    onClick={() => setSelectedJob(j)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedJob?.id === j.id ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10' 
                    }`}
                  >
                    {j.title}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#141426] border border-white/10 flex items-center justify-center text-2xl shadow-inner shrink-0 glow-violet">
                💼
              </div>
              <div className="flex flex-col">
                <h3 className="font-syne font-bold text-white text-lg leading-tight">{job.title}</h3>
                <span className="text-slate-400 text-sm">{job.department ?? ''}</span>
              </div>
            </div>
            <h4 className="text-white text-sm font-bold mb-3">Required Skills</h4>
            <div className="flex flex-wrap gap-2 mb-8">
              {(job.required_skills ?? []).map(skill => (
                <SkillBadge key={skill} skill={skill} type="required" />
              ))}
            </div>
            <div className="mt-4 pt-6 border-t border-white/5">
              <h4 className="text-white text-sm font-bold mb-2">Experience level</h4>
              <p className="text-slate-400 text-sm leading-relaxed capitalize">{job.experience_level}</p>
            </div>
            <div className="flex flex-col gap-3 mt-auto pt-8">
              <Link href="/applicant/jobs">
                <SecondaryButton className="w-full text-sm">Browse All Jobs</SecondaryButton>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function ResumePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            <span className="text-slate-400 font-dm-sans">Loading...</span>
          </div>
        </div>
      }
    >
      <ResumePageContent />
    </Suspense>
  );
}
