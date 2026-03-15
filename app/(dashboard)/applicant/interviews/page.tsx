"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ANIMATION_VARIANTS } from "@/lib/constants";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { getApplicationsByApplicant } from "@/app/actions/applications";
import type { Application } from "@/lib/types";

export default function ApplicantInterviewsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApplicationsByApplicant().then((res) => {
      if (res.data) setApplications(res.data);
      setLoading(false);
    });
  }, []);

  const withInterview = applications.filter((a) => a.status === "interviewing" || a.status === "applied" || a.status === "completed");

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={ANIMATION_VARIANTS.staggerContainer}
      className="flex flex-col gap-6 pb-12"
    >
      <h1 className="font-syne font-bold text-2xl md:text-3xl text-white">My Interviews</h1>
      <p className="text-slate-400 text-sm">Start or revisit your AI mock interviews.</p>

      {loading ? (
        <div className="glass-card p-12 text-center text-slate-500">Loading...</div>
      ) : withInterview.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-400 mb-6">You haven&apos;t started any interviews yet. Apply to a job and upload your resume to begin.</p>
          <Link href="/applicant/resume">
            <PrimaryButton>Go to Resume & Apply</PrimaryButton>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {withInterview.map((app) => (
            <motion.div
              key={app.id}
              variants={ANIMATION_VARIANTS.fadeUp}
              className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <h2 className="font-syne font-bold text-lg text-white">{app.job?.title ?? "Unknown"}</h2>
                <p className="text-slate-400 text-sm mt-1">Status: {app.status}</p>
              </div>
              {(app.status === "applied" || app.status === "interviewing") && (
                <Link href={`/applicant/interview/${app.id}`}>
                  <PrimaryButton className="text-sm">{app.status === "interviewing" ? "Continue Interview" : "Start Interview"}</PrimaryButton>
                </Link>
              )}
              {app.status === "completed" && (
                <Link href="/applicant">
                  <PrimaryButton className="text-sm">View in Dashboard</PrimaryButton>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
