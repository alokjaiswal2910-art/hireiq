"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ASSETS, ANIMATION_VARIANTS } from "@/lib/constants";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { getApplicationsByApplicant } from "@/app/actions/applications";
import { getApplicantStats } from "@/app/actions/progress";
import { getUser } from "@/app/actions/auth";
import type { Application } from "@/lib/types";

export default function ApplicantDashboard() {
  const [userName, setUserName] = useState<string>("");
  const [stats, setStats] = useState({ jobs_applied: 0, interviews_completed: 0, best_score: 0, average_score: 0, resume_score: 0 as number | null });
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [userRes, statsRes, appsRes] = await Promise.all([
        getUser(),
        getApplicantStats(),
        getApplicationsByApplicant(),
      ]);
      if (userRes.user?.full_name) setUserName(userRes.user.full_name.split(" ")[0] ?? "there");
      if (statsRes.data) setStats(statsRes.data);
      if (appsRes.data) setApplications(appsRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const currentScore = stats.resume_score ?? stats.average_score ?? 0;
  const appliedJobs = applications.slice(0, 5).map((app) => {
    const job = app.job;
    const title = job?.title ?? "Unknown";
    const status = app.status === "completed" ? "Completed" : app.status === "interviewing" ? "Interview" : "Applied";
    return {
      id: app.id,
      title,
      jobId: app.job_id,
      status,
      icon: status === "Completed" ? "✓" : status === "Interview" ? "🎤" : "💼",
    };
  });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={ANIMATION_VARIANTS.staggerContainer}
      className="flex flex-col gap-8 pb-12"
    >
      <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="mb-2">
        <h1 className="font-syne font-bold text-3xl md:text-4xl text-white mb-2">
          Good morning, {userName || "..."} 👋
        </h1>
        <p className="font-dm-sans text-slate-400">Ready to land your dream role?</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          variants={ANIMATION_VARIANTS.fadeUp}
          className="lg:col-span-2 glass-card rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border-t border-t-white/10"
        >
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 w-full">
            <ScoreRing score={loading ? 0 : currentScore} size={140} />
            <div className="flex flex-col text-center md:text-left">
              <span className="text-amber-400 font-bold tracking-widest text-xs uppercase mb-2">
                Overall Resume Fit
              </span>
              <h2 className="font-syne font-bold text-2xl text-white mb-2">
                {loading ? "Loading..." : currentScore > 70 ? "You're standing out!" : "Keep improving!"}
              </h2>
              <p className="font-dm-sans text-sm text-slate-400 max-w-sm">
                {loading ? "..." : `Your profile matches ${currentScore}% of the skills for your target roles. Take a mock interview to boost your rank.`}
              </p>
            </div>
          </div>
          <div className="relative w-32 h-32 md:w-48 md:h-48 shrink-0 relative z-10 glow-cyan rounded-full hidden sm:block">
            <Image
              src={currentScore > 80 ? ASSETS.models3d.trophy : ASSETS.models3d.avatarStatic}
              alt="Status"
              fill
              className="object-contain"
            />
          </div>
        </motion.div>

        <motion.div
          variants={ANIMATION_VARIANTS.fadeUp}
          className="lg:col-span-1 glass-card rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center border-l-2 border-l-violet-500"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🎤</span>
          </div>
          <h3 className="font-syne font-bold text-xl text-white mb-2">Your next interview</h3>
          <p className="font-dm-sans text-sm text-slate-400 mb-8">
            {applications.some((a) => a.status === "applied" || a.status === "interviewing")
              ? "Start your AI mock interview for an applied role."
              : "Apply to a job and upload your resume to start an interview."}
          </p>
          <Link href="/applicant/resume">
            <PrimaryButton className="w-full text-sm mt-auto shadow-[0_0_20px_rgba(124,58,237,0.3)]">
              {applications.length > 0 ? "Resume / Start Interview →" : "Upload Resume & Apply →"}
            </PrimaryButton>
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="lg:col-span-1 flex flex-col gap-4">
          <div className="glass-card p-6 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-3xl font-syne font-bold text-white mb-1">{stats.jobs_applied}</span>
              <span className="text-sm font-dm-sans text-slate-400">Jobs Applied</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl">💼</div>
          </div>
          <div className="glass-card p-6 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-3xl font-syne font-bold text-white mb-1">{stats.interviews_completed}</span>
              <span className="text-sm font-dm-sans text-slate-400">Interviews Completed</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl">🎯</div>
          </div>
          <div className="glass-card p-6 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-3xl font-syne font-bold text-white mb-1">{stats.best_score}%</span>
              <span className="text-sm font-dm-sans text-slate-400">Best Score</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl">⭐</div>
          </div>
        </motion.div>

        <motion.div variants={ANIMATION_VARIANTS.fadeUp} className="lg:col-span-2 glass-card p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-syne font-bold text-xl text-white">Recent Applications</h2>
            <Link href="/applicant/resume" className="text-sm font-dm-sans text-violet-400 hover:text-violet-300 transition-colors">
              Apply to Job →
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="text-slate-500 py-8 text-center">Loading...</div>
            ) : appliedJobs.length === 0 ? (
              <div className="text-slate-500 py-8 text-center">No applications yet. Upload your resume to apply.</div>
            ) : (
              appliedJobs.map((item, i) => (
                <Link key={item.id} href={item.status === "Interview" || item.status === "Applied" ? `/applicant/interview/${item.id}` : "#"}>
                  <motion.div
                    custom={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#141426] flex items-center justify-center text-2xl border border-white/10 shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-base">{item.title}</span>
                        <span className="text-sm text-slate-400">{item.status}</span>
                      </div>
                    </div>
                    {(item.status === "Interview" || item.status === "Applied") && (
                      <span className="px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        {item.status === "Interview" ? "Start Interview" : "View"}
                      </span>
                    )}
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
